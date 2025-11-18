import { Injectable } from '@nestjs/common';
import moment from 'moment';
import _ from 'lodash';
import ExcelJS from 'exceljs';
import type { Anchor } from 'exceljs';
import child_process from 'child_process';
import path from 'path';
import sizeOf from 'image-size';

import { PricingType } from '@/constants';
import { UtilService } from '@/modules/global/util/services/util.service';
import { MakeQuotationDto } from '../dto/make-quotation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  SKUEntity,
  ImageEntity,
  ProductEntity,
  TenantEntity,
} from '@/database/entities';

@Injectable()
export class QuotationService {
  constructor(
    @InjectRepository(SKUEntity)
    private readonly skuRepository: Repository<SKUEntity>,

    @InjectRepository(ImageEntity)
    private readonly imageRepository: Repository<ImageEntity>,

    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,

    @InjectRepository(TenantEntity)
    private readonly tenantRepository: Repository<TenantEntity>,

    private readonly utilService: UtilService,
  ) {}

  async makeQuotation(user: UserInfo, dto: MakeQuotationDto) {
    const { tenantId, sub: userId } = user;
    const { customerId, products } = dto;
    const skus = await this.skuRepository.find({
      where: { tenantId, skuCode: In(_.map(products, (i) => i.skuCode)) },
    });
    const [productList, imageList, tenantInfo] = await Promise.all([
      this.productRepository.find({
        where: { tenantId, id: In(_.map(skus, (i) => i.productId)) },
      }),
      this.imageRepository.find({
        where: { tenantId, id: In(_.map(skus, (i) => i.imageId)) },
      }),
      this.tenantRepository.findOneBy({ id: tenantId }),
    ]);
    const productMap = _.keyBy(productList, 'id');
    const imageMap = _.keyBy(imageList, 'id');
    const skuMap = _.groupBy(skus, 'productId');
    const countMap = _.keyBy(products, 'skuCode');

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('quotation');

    // 全局变量，设置当前行和图片的宽度
    let currentRow = 1;
    let minRowHeight = 33;

    // 设置公司信息并更新当前所在行
    currentRow = this.setCompanyInfo(sheet, { currentRow, tenantInfo });

    // 设置表头
    currentRow = this.setHeader(sheet, currentRow);

    for (const productId of Object.keys(skuMap)) {
      // 产品信息、sku信息
      const productInfo = productMap[productId];
      const skus = skuMap[productId];
      const imageId = skus[0].imageId;

      const rowHeight = skus.length === 1 ? minRowHeight * 2 : minRowHeight;
      const pictureStartRow = currentRow;
      const pictureEndRow = currentRow + skus.length - 1;

      for (const sku of skus) {
        const row = sheet.getRow(currentRow);
        row.height = rowHeight;
        row.font = {
          name: 'Calibri',
          size: 12,
        };
        row.getCell('sku').value = sku.skuCode;

        row.getCell('desc').value =
          sku.pricingType === PricingType.PriceByAttribute
            ? sku.desc
            : productInfo.desc;

        row.getCell('size').value =
          sku.pricingType === PricingType.PriceByAttribute
            ? Number(sku.attributeValue)
            : sku.desc || productInfo.desc;
        if (sku.pricingType === PricingType.PriceByAttribute) {
          row.getCell('size').numFmt = `General" ${sku.unit}"`;
        }

        row.getCell('qty').value = countMap[sku.skuCode].quantity;
        row.getCell('qty').numFmt = '0 "pc"';

        // 单价不主动计算
        // row.getCell('unitPrice').value = sku.unitPrice;
        row.getCell('unitPrice').numFmt = `$0.00 "/${sku.unit}"`;

        // 计算成本价
        row.getCell('cost').value = Number(sku.unitPrice);
        row.getCell('cost').numFmt = `0.00 "/${sku.unit}"`;

        // 计算单行价格
        row.getCell('totalPrice').value = {
          formula:
            sku.pricingType === PricingType.PriceByAttribute
              ? `E${currentRow}*F${currentRow}*G${currentRow}`
              : `F${currentRow}*G${currentRow}`,
        };

        // 计算单行重量
        row.getCell('totalWeight').value = {
          formula: `F${currentRow}*${sku.weight}`,
        };
        row.getCell('totalWeight').numFmt = 'General" kg"';

        // 计算单行总体积
        row.getCell('totalCBM').value = {
          formula: `F${currentRow}*${sku.length * sku.height * sku.height}`,
        };
        row.getCell('totalCBM').numFmt = '0.00" cbm"';

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
            nativeRow: pictureStartRow - 1, // 行索引从0开始
            nativeCol: 0, // 列索引从0开始
            nativeRowOff:
              9525 * Math.floor((rowHeight * skus.length * 1.33 - height) / 4),
            nativeColOff:
              9525 *
              Math.floor(
                ((sheet.getColumn('picture').width ?? 25) * 7 - width) / 2,
              ),
          } as Anchor,
          ext: { width, height },
          editAs: 'absolute',
        },
      );
    }

    // 后面儿放开
    // this.setSheetStyle(sheet);

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

  private setHeader(sheet: ExcelJS.Worksheet, currentRow: number) {
    // 表头
    sheet.columns = [
      { key: 'picture', width: 25 },
      { key: 'product', width: 20 },
      { key: 'sku', width: 20 },
      { key: 'desc', width: 25 },
      { key: 'size', width: 25 },
      { key: 'qty', width: 15 },
      { key: 'unitPrice', width: 25 },
      { key: 'totalPrice', width: 25 },
      { key: 'totalWeight', width: 25 },
      { key: 'totalCBM', width: 25 },
      { key: 'cost', width: 25 },
    ];

    const headers = [
      'PICTURE',
      'PRODUCT',
      'SKU',
      'SPECIFICATION',
      'Size',
      'QTY',
      'UNIT PRICE',
      'TOTAL PRICE(USD)',
      'TOTAL N.W.(KGS)',
      'MEAS.(CBM)',
      '成本(核算)',
    ];
    const headerRow = sheet.getRow(currentRow);
    sheet.columns.forEach((col, idx) => {
      const cell = headerRow.getCell(idx + 1);
      cell.value = headers[idx];
    });
    headerRow.height = 45;
    headerRow.eachCell((cell) => {
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
      cell.alignment = {
        wrapText: true,
        vertical: 'middle',
        horizontal: 'center',
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
    return currentRow + 1;
  }

  private setCompanyInfo(
    sheet: ExcelJS.Worksheet,
    {
      currentRow,
      tenantInfo,
    }: { currentRow: number; tenantInfo: TenantEntity | null },
  ): number {
    // 第一次合并
    // 公司信息（从A到D，从第一行到第三行合并）
    sheet.mergeCells('A1:D3');
    sheet.getCell('A1').value = tenantInfo?.name;
    sheet.getCell('A1').alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };
    sheet.getCell('A1').font = { name: 'Tahoma Regular', bold: true, size: 24 };

    // 发票信息标签（E 列）
    sheet.mergeCells('E1:F1');
    sheet.mergeCells('E2:F2');
    sheet.mergeCells('E3:F3');
    sheet.getCell('E1').value = 'INVOICE NO:';
    sheet.getCell('E2').value = 'REVISION:';
    sheet.getCell('E3').value = 'INVOICE DATE:';
    ['E1', 'E2', 'E3'].forEach((cell) => {
      sheet.getCell(cell).alignment = {
        vertical: 'middle',
        horizontal: 'center',
      };
      sheet.getCell(cell).font = {
        name: 'Tahoma Regular',
        bold: true,
        size: 14,
      };
    });

    // 发票信息（G 列到 J 列）
    sheet.mergeCells('G1:J1');
    sheet.getCell('G1').value = this.utilService.generateInvoiceNo();
    sheet.mergeCells('G2:J2');
    sheet.getCell('G2').value = '0';
    sheet.mergeCells('G3:J3');
    sheet.getCell('G3').value = moment().format('YYYY/M/D');
    // 提示列
    sheet.getCell('K1').value = '此列使用后需删除';
    sheet.getCell('K1').font = {
      color: { argb: 'FFFF0000' }, // 红色字体
      bold: true,
      size: 14,
    };
    ['G1', 'G2', 'G3'].forEach((cell) => {
      sheet.getCell(cell).alignment = {
        vertical: 'middle',
        horizontal: 'center',
      };
      sheet.getCell(cell).font = {
        name: 'Tahoma Regular',
        size: 14,
      };
    });
    for (let r = 1; r <= 3; r++) {
      sheet.getRow(r).height = 25;
    }

    // 第二次合并
    // 电话、传真、地址
    sheet.mergeCells('A4:D5');
    sheet.getCell('A4').value =
      `Tel: ${tenantInfo?.tel}\nFAX: ${tenantInfo?.fax}\nAdd: ${tenantInfo?.address}`;
    sheet.getCell('A4').alignment = {
      wrapText: true,
      vertical: 'middle',
      horizontal: 'center',
    };
    sheet.getCell('A4').font = { name: 'Tahoma Regular', size: 14 };

    sheet.mergeCells('E4:F4');
    sheet.mergeCells('E5:F5');
    sheet.getCell('E4').value = 'TO:';
    sheet.getCell('E5').value = 'ATTN:';
    ['E4', 'E5'].forEach((cell) => {
      sheet.getCell(cell).alignment = {
        vertical: 'middle',
        horizontal: 'center',
      };
      sheet.getCell(cell).font = {
        name: 'Tahoma Regular',
        bold: true,
        size: 14,
      };
    });

    // 合并展示客户信息
    // TODO: 这里需要替换真实的用户数据
    sheet.mergeCells('G4:J5');
    sheet.getCell('G4').value =
      `Company: Gadolex SA\nAd.: Isidoro de María 1727\nRUT: 215340610019\nCountry : Uruguay\nCity : Montevideo\nzip code :11800\nTel: (598)29243689\nAlejandro Birnbaun Móvil:(598)99638757`;
    sheet.getCell('G4').alignment = {
      wrapText: true,
      vertical: 'middle',
      horizontal: 'center',
    };
    sheet.getCell('G4').font = { name: 'Tahoma Regular', size: 14 };
    _.forEach([4, 5], (i) => {
      sheet.getRow(i).height = 90;
    });

    // 第三次合并
    // 运输方式
    sheet.mergeCells('A6:D9');
    sheet.getCell('A6').value = 'QUOTE SHEET';
    sheet.getCell('A6').alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };
    sheet.getCell('A6').font = { name: 'Tahoma Regular', bold: true, size: 24 };
    sheet.mergeCells('E6:F6');
    sheet.mergeCells('E7:F7');
    sheet.mergeCells('E8:F8');
    sheet.mergeCells('E9:F9');
    sheet.getCell('E6').value = 'TRADE TERM:';
    sheet.getCell('E7').value = 'PAYMENT TERM:';
    sheet.getCell('E8').value = 'LOAD PORT:';
    sheet.getCell('E9').value = 'DESTINATION:';
    ['E6', 'E7', 'E8', 'E9'].forEach((cell) => {
      sheet.getCell(cell).alignment = {
        vertical: 'middle',
        horizontal: 'center',
      };
      sheet.getCell(cell).font = {
        color: cell === 'E6' ? { argb: 'FFFF0000' } : { argb: 'FF000000' },
        name: 'Tahoma Regular',
        bold: true,
        size: 14,
      };
    });
    sheet.mergeCells('G6:J6');
    sheet.mergeCells('G7:J7');
    sheet.mergeCells('G8:J8');
    sheet.mergeCells('G9:J9');
    sheet.getCell('G6').value = 'FOB Nantong ( Full container )';
    sheet.getCell('G7').value = '30%+70%T/T';
    sheet.getCell('G8').value = 'Nantong, China';
    sheet.getCell('G9').value = 'Montevideo Uruguay';
    ['G6', 'G7', 'G8', 'G9'].forEach((cell) => {
      sheet.getCell(cell).alignment = {
        vertical: 'middle',
        horizontal: 'center',
      };
      sheet.getCell(cell).font = {
        color: cell === 'G6' ? { argb: 'FFFF0000' } : { argb: 'FF000000' },
        name: 'Tahoma Regular',
        size: 14,
      };
    });
    _.forEach([6, 7, 8, 9], (i) => {
      sheet.getRow(i).height = 25;
    });

    return currentRow + 9;
  }

  private setSheetStyle(sheet: ExcelJS.Worksheet) {
    sheet.pageSetup = {
      orientation: 'portrait',
      scale: 70,
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
    };
    sheet.views = [
      {
        style: 'pageBreakPreview', // 默认分页预览模式
        zoomScale: 70,
      },
    ];
  }
}
