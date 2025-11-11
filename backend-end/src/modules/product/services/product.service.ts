import ExcelJS from 'exceljs';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { ProductStatus, ProductImportStatus } from '@/constants';
import { Repository, DataSource } from 'typeorm';
import { ProductEntity, ImageEntity, SKUEntity } from '@/database/entities';
import { UtilService } from '@/modules/global/util/services/util.service';

interface LeadinProductRow {
  name?: string;
  tenantId: string;
  productId: string;
  imageId: string;
  skuCode: string;
  desc: string;
  unit: string;
  unitPrice: number;
  status?: ProductImportStatus;
}

@Injectable()
export class ProductService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,

    @InjectRepository(SKUEntity)
    private readonly skuRepository: Repository<SKUEntity>,

    @InjectRepository(ImageEntity)
    private readonly imageRepository: Repository<ImageEntity>,

    private readonly utilService: UtilService,
  ) {}

  async leadinProduct(user: any, buffer: any) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const sheet = workbook.worksheets[0];

    // 表头数据映射
    const headerMap: Record<string, number> = {};
    sheet.getRow(1).eachCell((cell, col) => {
      headerMap[cell.text] = col;
    });

    // 图片数据映射
    const imageIdMap = new Map<number, any>(); // Excel row -> image buffer
    sheet.getImages().forEach((image) => {
      imageIdMap.set(
        Math.round(image.range.tl.row) + 1,
        workbook.getImage(image.imageId as any).buffer,
      );
    });
    const result: SKUEntity[] = [];
    const failedProducts: { code: string; reason: string }[] = [];

    await this.dataSource.transaction(async (manager) => {
      const productRepo = manager.getRepository(ProductEntity);
      const imageRepo = manager.getRepository(ImageEntity);
      const skuRepo = manager.getRepository(SKUEntity);

      for (let rowIndex = 2; rowIndex <= sheet.rowCount; rowIndex++) {
        const row = sheet.getRow(rowIndex);

        const product: LeadinProductRow = {
          name: row.getCell(headerMap['产品名称']).value as string,
          skuCode: row.getCell(headerMap['产品型号']).value as string,
          desc: row.getCell(headerMap['产品描述']).value as string,
          unit: row.getCell(headerMap['产品单位']).value as string,
          unitPrice: row.getCell(headerMap['产品价格']).value as number,
          status: row.getCell(headerMap['产品状态'])
            .value as ProductImportStatus,
          tenantId: user.tenantId,
          productId: '',
          imageId: '',
        };

        // 如果没有数据提前退出
        if (!product.skuCode) {
          break;
        }

        const [productId, imageId] = await Promise.all([
          this.saveProduct(
            { tenantId: user.tenantId, name: String(product.name) },
            productRepo,
          ),
          this.saveImage(
            { tenantId: user.tenantId, buffer: imageIdMap.get(rowIndex) },
            imageRepo,
          ),
        ]);

        if (!productId || !imageId) {
          failedProducts.push({
            code: product.skuCode,
            reason: productId ? 'Missing imageId' : 'Missing productId',
          });
          continue;
        }

        product.imageId = imageId;
        product.productId = productId;
        delete product.name;

        const skuInfo = await this.saveSKU(product, skuRepo);
        result.push(skuInfo);
      }
    });

    return { failedProducts, successProducts: result };
  }

  private async saveSKU(
    {
      tenantId,
      productId,
      imageId,
      skuCode,
      desc,
      unit,
      unitPrice,
      status,
    }: LeadinProductRow,
    repo = this.skuRepository,
  ): Promise<SKUEntity> {
    // 查数据库是否已有对应 SKU
    let sku = await repo.findOne({ where: { tenantId, skuCode } });
    if (sku) {
      const updateFields = {
        productId,
        imageId,
        desc,
        unit,
        unitPrice,
        status:
          status === ProductImportStatus.ValidString
            ? ProductStatus.Valid
            : ProductStatus.InValid,
      };
      Object.assign(sku, updateFields);
      return repo.save(sku);
    }

    sku = repo.create({
      tenantId,
      productId,
      skuCode,
      imageId,
      desc,
      unit,
      unitPrice,
      status:
        status === ProductImportStatus.ValidString
          ? ProductStatus.Valid
          : ProductStatus.InValid,
    });
    await repo.save(sku);
    return sku;
  }

  private async saveProduct(
    { tenantId, name }: { tenantId: string; name: string },
    repo = this.productRepository,
  ): Promise<string> {
    // 2. 查数据库是否已有对应产品
    let product = await repo.findOne({
      where: { tenantId, name, status: ProductStatus.Valid },
    });
    if (product) return product.id; // 已存在，复用 productId

    product = repo.create({
      tenantId,
      name,
    });
    await repo.save(product);
    return product.id;
  }

  private async saveImage(
    { tenantId, buffer }: { tenantId: string; buffer: Buffer },
    repo = this.imageRepository,
  ): Promise<string> {
    // 1. 生成哈希
    const hashData = await this.utilService.generateHash(buffer);

    // 2. 查数据库是否已有相同图片
    let image = await repo.findOne({
      where: { tenantId, hashData },
    });
    if (image) return image.id; // 已存在，复用 imageId

    // 3. 转 Base64 并存储
    image = repo.create({
      tenantId,
      hashData,
      base64Data: buffer.toString('base64'),
    });
    await repo.save(image);
    return image.id;
  }
}
