import _ from 'lodash';
import ExcelJS from 'exceljs';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import {
  ProductStatus,
  ProductImportStatus,
  PricingType,
  PricingImportType,
} from '@/constants';
import { Repository, DataSource, Like } from 'typeorm';
import { ProductEntity, ImageEntity, SKUEntity } from '@/database/entities';
import { UtilService } from '@/modules/global/util/services/util.service';
import { BusinessErrorHelper } from '@/common';
import { ListProductSkuDto } from '../dto/list-product-sku.dto';
import { ListProductDto } from '../dto/list-product.dto';
import { ListSkuDto } from '../dto/list-sku.dto';
import { DeleteSkuDto } from '../dto/delete-sku.dto';

interface LeadinProductRow {
  order: number;
  name: string;
  productDesc: string;
  pricingType: PricingImportType;
  attributeValue: number;
  tenantId: string;
  productId: string;
  imageId: string;
  skuCode: string;
  desc: string;
  unit: string;
  unitPrice: number;
  weight: number;
  length: number;
  width: number;
  height: number;
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

  async leadinProduct(user: UserInfo, buffer: any) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const sheet = workbook.worksheets[0];

    // 图片数据映射
    const images = _.chain(sheet.getImages())
      .sort((a, b) => a.range.tl.row - b.range.tl.row)
      .map((i) => workbook.getImage(i.imageId as any).buffer)
      .value();

    const products: LeadinProductRow[] = this.resolveProductFromExcel(
      user,
      sheet,
    );

    const uniqProductList = _.map(
      _.uniqBy(products, (i) => i.name),
      (i) => ({ name: i.name, productDesc: i.productDesc }),
    );

    if (images.length !== uniqProductList.length) {
      return BusinessErrorHelper.Platform.fileAndImageCountNotMatch();
    }

    const result: any = [];

    await this.dataSource.transaction(async (manager) => {
      // 事务内使用的仓库
      const productRepo = manager.getRepository(ProductEntity);
      const imageRepo = manager.getRepository(ImageEntity);
      const skuRepo = manager.getRepository(SKUEntity);

      const imageIds = await Promise.all(
        _.map(images, async (image) =>
          this.saveImage(
            {
              tenantId: user.tenantId,
              buffer: image,
            },
            imageRepo,
          ),
        ),
      );

      const productIds = await Promise.all(
        _.map(uniqProductList, async (product, index) => {
          return this.saveProduct(
            {
              tenantId: user.tenantId,
              imageId: imageIds[index],
              name: product.name,
              desc: product.productDesc,
            },
            productRepo,
          );
        }),
      );

      for (const item of products) {
        const index = _.findIndex(uniqProductList, (i) => i.name === item.name);
        item.imageId = imageIds[index];
        item.productId = productIds[index];
        const skuInfo = await this.saveSKU(item, skuRepo);
        result.push(_.omit(skuInfo, ['tenantId', 'createTime', 'updateTime']));
      }
    });

    return result;
  }

  async listProductSku(user: UserInfo, dto: ListProductSkuDto) {
    const qb = this.skuRepository
      .createQueryBuilder('sku')
      .innerJoinAndSelect('sku.product', 'product')
      .innerJoinAndSelect('product.image', 'image')
      .where('sku.tenantId = :tenantId', { tenantId: user.tenantId });

    if (dto.productNo) {
      qb.andWhere('product.name LIKE :name', { name: `%${dto.productNo}%` });
    }

    if (dto.skuCode) {
      qb.andWhere('sku.skuCode LIKE :skuCode', { skuCode: `%${dto.skuCode}%` });
    }

    if (dto.status !== undefined) {
      qb.andWhere('sku.status = :status', { status: dto.status });
    }

    const [list, total] = await qb
      .orderBy('sku.productId', 'DESC')
      .addOrderBy('sku.order', 'ASC')
      .skip((dto.pageIndex - 1) * dto.pageSize)
      .take(dto.pageSize)
      .getManyAndCount();
    return {
      list: _.map(list, (i) => ({
        productId: i.productId,
        skuCode: i.skuCode,
        pricingTypeDesc:
          i.pricingType === PricingType.PriceByUnit
            ? PricingImportType.PriceByUnitString
            : PricingImportType.PriceByAttributeString,
        attributeValue: i.attributeValue,
        weight: `${i.weight}kg`,
        unitPrice: i.unitPrice,
        desc: i.desc,
        status: i.status,
        productName: i.product.name,
        productDesc: i.product.desc,
        image: `data:image/png;base64,${i.product.image.base64Data}`,
        createTime: i.createTime,
      })),
      total,
      currentPage: dto.pageIndex,
      pageSize: dto.pageSize,
    };
  }

  async listProduct(user: UserInfo, dto: ListProductDto) {
    const res = await this.productRepository.find({
      where: {
        tenantId: user.tenantId,
        name: Like(`%${dto.productNo}%`),
        status: ProductStatus.Valid,
      },
      select: ['id', 'name', 'desc'],
      take: dto.pageSize,
    });
    return { list: res };
  }

  async listSku(user: UserInfo, dto: ListSkuDto) {
    const res = await this.skuRepository.find({
      where: {
        tenantId: user.tenantId,
        productId: dto.productId,
        status: ProductStatus.Valid,
      },
      select: ['skuCode', 'desc', 'unitPrice', 'unit', 'weight'],
      order: { order: 'ASC' },
    });
    return { list: res };
  }

  async deleteSku(user: UserInfo, dto: DeleteSkuDto) {
    const sku = await this.skuRepository.findOne({
      where: {
        tenantId: user.tenantId,
        skuCode: dto.skuCode,
      },
    });
    if (!sku) {
      return BusinessErrorHelper.Platform.skuNotFound();
    }
    await this.skuRepository.delete(sku);
    return { skuCode: dto.skuCode };
  }

  async offlineSku(user: UserInfo, dto: DeleteSkuDto) {
    const sku = await this.skuRepository.findOne({
      where: {
        tenantId: user.tenantId,
        skuCode: dto.skuCode,
      },
    });
    if (!sku) {
      return BusinessErrorHelper.Platform.skuNotFound();
    }
    sku.status =
      sku.status === ProductStatus.Valid
        ? ProductStatus.InValid
        : ProductStatus.Valid;
    await this.skuRepository.save(sku);
    return { skuCode: dto.skuCode };
  }

  private async saveSKU(
    {
      tenantId,
      productId,
      imageId,
      pricingType,
      attributeValue,
      skuCode,
      desc,
      order,
      unit,
      unitPrice,
      status,
      weight,
      length,
      width,
      height,
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
        order,
        unit,
        unitPrice,
        weight,
        length,
        width,
        height,
        pricingType:
          pricingType === PricingImportType.PriceByAttributeString
            ? PricingType.PriceByAttribute
            : PricingType.PriceByUnit,
        attributeValue:
          pricingType === PricingImportType.PriceByAttributeString
            ? attributeValue
            : undefined,
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
      order,
      unit,
      unitPrice,
      weight,
      length,
      width,
      height,
      pricingType:
        pricingType === PricingImportType.PriceByAttributeString
          ? PricingType.PriceByAttribute
          : PricingType.PriceByUnit,
      attributeValue:
        pricingType === PricingImportType.PriceByAttributeString
          ? attributeValue
          : undefined,
      status:
        status === ProductImportStatus.ValidString
          ? ProductStatus.Valid
          : ProductStatus.InValid,
    });
    await repo.save(sku);
    return sku;
  }

  private async saveProduct(
    {
      tenantId,
      imageId,
      name,
      desc,
    }: { tenantId: string; imageId: string; name: string; desc: string },
    repo = this.productRepository,
  ): Promise<string> {
    // 2. 查数据库是否已有对应产品
    let product = await repo.findOne({
      where: { tenantId, name, status: ProductStatus.Valid },
    });
    if (product) {
      product.imageId = imageId;
      product.desc = desc;
      await repo.save(product);
      return product.id;
    }

    product = repo.create({
      tenantId,
      name,
      desc,
      imageId,
    });
    await repo.save(product);
    return product.id;
  }

  private async saveImage(
    { tenantId, buffer }: { tenantId: string; buffer: any },
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

  private resolveProductFromExcel(user: UserInfo, sheet: ExcelJS.Worksheet) {
    // 表头数据映射
    const headerMap: Record<string, number> = {};
    sheet.getRow(1).eachCell((cell, col) => {
      headerMap[cell.text] = col;
    });

    const products = [];
    for (let rowIndex = 2; rowIndex <= sheet.rowCount; rowIndex++) {
      const row = sheet.getRow(rowIndex);

      const [length, width, height] = (
        row.getCell(headerMap['产品尺寸（m³）']).value as string
      ).split('*');

      const product = {
        order: row.getCell(headerMap['序号']).value as number,
        name: row.getCell(headerMap['产品名称']).value as string,
        productDesc: row.getCell(headerMap['产品描述']).value as string,
        pricingType: row.getCell(headerMap['计价方式'])
          .value as PricingImportType,
        skuCode: row.getCell(headerMap['产品型号']).value as string,
        attributeValue: row.getCell(headerMap['产品属性']).value as number,
        desc: row.getCell(headerMap['型号描述']).value as string,
        unit: row.getCell(headerMap['产品单位']).value as string,
        unitPrice: row.getCell(headerMap['产品价格']).value as number,
        weight: row.getCell(headerMap['产品重量（kg）']).value as number,
        status: row.getCell(headerMap['产品状态']).value as ProductImportStatus,
        length: Number(length),
        width: Number(width),
        height: Number(height),
        tenantId: user.tenantId,
        productId: '',
        imageId: '',
      };

      products.push(product);

      // 如果没有数据提前退出
      if (!product.skuCode) {
        break;
      }
    }
    return products;
  }
}
