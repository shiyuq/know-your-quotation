import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import ExcelJS from 'exceljs';
import child_process from 'child_process';
import path from 'path';

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
    // for (const product of skus) {
    //   const skuCount = product.skus.length;
    //   const rowHeight = skuCount === 1 ? 70 : 35;

    //   const pictureStartRow = currentRow;
    //   const pictureEndRow = currentRow + skuCount - 1;

    //   // 插入 SKU 行
    //   for (const sku of product.skus) {
    //     const row = sheet.getRow(currentRow);
    //     row.height = rowHeight;

    //     row.getCell('sku').value = sku.skuCode;
    //     row.getCell('size').value = sku.size;
    //     row.getCell('qty').value = sku.qty;
    //     row.getCell('unitPrice').value = sku.unitPrice;
    //     row.getCell('totalPrice').value = {
    //       formula: `E${currentRow}*F${currentRow}`,
    //     };

    //     // 单元格居中
    //     row.alignment = { vertical: 'middle', horizontal: 'center' };

    //     currentRow++;
    //   }
    //   // 合并 PRODUCT 单元格
    //   if (skuCount > 1) {
    //     sheet.mergeCells(`B${pictureStartRow}:B${pictureEndRow}`);
    //     sheet.mergeCells(`A${pictureStartRow}:A${pictureEndRow}`);
    //   }

    //   // 写入 PRODUCT 名称
    //   sheet.getCell(`B${pictureStartRow}`).value = product.productName;
    //   sheet.getCell(`B${pictureStartRow}`).alignment = {
    //     vertical: 'middle',
    //     horizontal: 'center',
    //   };

    //   // 插入图片
    //   if (product.imageBase64) {
    //     const imgId = workbook.addImage({
    //       base64: product.imageBase64,
    //       extension: 'png',
    //     });

    //     sheet.addImage(imgId, {
    //       tl: { col: 0, row: pictureStartRow - 1 },
    //       br: { col: 1, row: pictureEndRow - 1 },
    //       editAs: 'oneCell',
    //     });
    //   }
    // }

    await workbook.xlsx.writeFile('src/temp/quote.xlsx');

    child_process.exec(`start "" "${path.resolve('src/temp/quote.xlsx')}"`);

    return productMap;
  }
}
