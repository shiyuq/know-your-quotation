import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import ExcelJS from 'exceljs';
import child_process from 'child_process';
import path from 'path';
import sizeOf from 'image-size';

import { PricingType } from '@/constants';
import { BusinessErrorHelper } from '@/common';
import { MakeQuotationDto } from '../dto/make-quotation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { SKUEntity, ImageEntity, ProductEntity } from '@/database/entities';

@Injectable()
export class QuotationService {
  constructor(
    @InjectRepository(SKUEntity)
    private readonly skuRepository: Repository<SKUEntity>,

    @InjectRepository(ImageEntity)
    private readonly imageRepository: Repository<ImageEntity>,

    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async makeQuotation(user: any, dto: MakeQuotationDto) {
    const { tenantId, sub: userId } = user;
    const { customerId, products } = dto;
    const skus = await this.skuRepository.find({
      where: { tenantId, skuCode: In(_.map(products, (i) => i.skuCode)) },
    });
    const [productList, imageList] = await Promise.all([
      this.productRepository.find({
        where: { tenantId, id: In(_.map(skus, (i) => i.productId)) },
      }),
      this.imageRepository.find({
        where: { tenantId, id: In(_.map(skus, (i) => i.imageId)) },
      }),
    ]);
    const productMap = _.keyBy(productList, 'id');
    const imageMap = _.keyBy(imageList, 'id');
    const skuMap = _.groupBy(skus, 'productId');
    const countMap = _.keyBy(products, 'skuCode');

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('quotation');

    // 表头
    sheet.columns = [
      { header: 'PICTURE', key: 'picture', width: 25 },
      { header: 'PRODUCT', key: 'product', width: 20 },
      { header: 'SKU', key: 'sku', width: 20 },
      { header: 'SPECIFICATION', key: 'desc', width: 25 },
      { header: 'Size', key: 'size', width: 25 },
      { header: 'QTY', key: 'qty', width: 15 },
      { header: 'UNIT PRICE', key: 'unitPrice', width: 25 },
      { header: 'TOTAL PRICE', key: 'totalPrice', width: 25 },
    ];

    sheet.getRow(1).height = 45;
    sheet.getRow(1).eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF000000' }, // 黑色背景
      };
      cell.font = {
        name: 'Tahoma Regular',
        size: 14,
        color: { argb: 'FFFFFFFF' }, // 白色字体
        bold: true,
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    let currentRow = 2;
    for (const productId of Object.keys(skuMap)) {
      // 产品信息、sku信息
      const productInfo = productMap[productId];
      const skus = skuMap[productId];
      const imageId = skus[0].imageId;

      const rowHeight = skus.length === 1 ? 66 : 33;
      const pictureStartRow = currentRow;
      const pictureEndRow = currentRow + skus.length - 1;

      for (const sku of skus) {
        const row = sheet.getRow(currentRow);
        row.height = rowHeight;
        row.getCell('sku').value = sku.skuCode;
        row.getCell('desc').value =
          sku.pricingType === PricingType.PriceByAttribute
            ? sku.desc
            : productInfo.desc;
        row.getCell('size').value =
          sku.pricingType === PricingType.PriceByAttribute
            ? sku.attributeValue
            : productInfo.desc;
        row.getCell('qty').value = countMap[sku.skuCode].quantity;
        row.getCell('unitPrice').value = sku.unitPrice;
        row.getCell('totalPrice').value = {
          formula:
            sku.pricingType === PricingType.PriceByAttribute
              ? `E${currentRow}*F${currentRow}*G${currentRow}`
              : `F${currentRow}*G${currentRow}`,
        };

        // 单元格居中
        row.alignment = { vertical: 'middle', horizontal: 'center' };
        currentRow++;
      }

      // 合并一些需要合并的单元格
      if (skus.length > 1) {
        // 合并product
        sheet.mergeCells(`B${pictureStartRow}:B${pictureEndRow}`);
        // 合并image
        sheet.mergeCells(`A${pictureStartRow}:A${pictureEndRow}`);
      }

      // 写入 PRODUCT 名称
      sheet.getCell(`B${pictureStartRow}`).value = productInfo.name;
      sheet.getCell(`B${pictureStartRow}`).alignment = {
        vertical: 'middle',
        horizontal: 'center',
      };

      // 计算图片的大小
      const { width, height } = this.calculateImageSize(
        imageMap[imageId].base64Data,
        rowHeight * skus.length,
      );
      sheet.addImage(
        workbook.addImage({
          base64: imageMap[imageId].base64Data,
          extension: 'png',
        }),
        {
          tl: {
            col: 0,
            row: pictureStartRow - 1,
            nativeColOff: 10,
            nativeRowOff: 10,
          },
          ext: { width, height },
          editAs: 'oneCell',
        },
      );
    }

    await workbook.xlsx.writeFile('src/temp/quote.xlsx');

    child_process.exec(`start "" "${path.resolve('src/temp/quote.xlsx')}"`);

    return skuMap;
  }

  private calculateImageSize(base64Data: string, rowHeight: number) {
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const { width: origW, height: origH } = sizeOf(imageBuffer);

    const totalRowHeight = rowHeight - 10;

    // 按比例缩放图片
    const scale = totalRowHeight / origH;
    const scaledHeight = totalRowHeight;
    const scaledWidth = origW * scale;

    return { width: scaledWidth, height: scaledHeight };
  }
}
