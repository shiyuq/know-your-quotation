import {
  ImageEntity,
  ProductEntity,
  SKUEntity,
  TenantEntity,
} from '@/database/entities';
import { MakeQuotationDto, ProductItemDto } from '../dto/make-quotation.dto';

import type { Anchor } from 'exceljs';
import ExcelJS from 'exceljs';
import { ImageRepository } from '@/database/repository/image.repository';
import { In } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { PricingType } from '@/constants';
import { ProductRepository } from '@/database/repository/product.repository';
import { SKURepository } from '@/database/repository/sku.repository';
import { TenantRepository } from '@/database/repository/tenant.repository';
import { UtilService } from '@/modules/global/util/services/util.service';
import _ from 'lodash';
import { getCurrentTenantOrThrow } from '@/common/context/request-context';
import moment from 'moment';
import sizeOf from 'image-size';

// import child_process from 'child_process';
// import path from 'path';


@Injectable()
export class QuotationService {
  constructor(
    private readonly skuRepository: SKURepository,
    private readonly productRepository: ProductRepository,
    private readonly tenantRepository: TenantRepository,
    private readonly imageRepository: ImageRepository,

    private readonly utilService: UtilService,
  ) {}

  async makeQuotation(dto: MakeQuotationDto) {
    const { products } = dto;
    const skus = await this.skuRepository.find({
      where: { skuCode: In(_.map(products, (i) => i.skuCode)) },
      order: { order: 'ASC' },
    });
    const [productList, tenantInfo] = await Promise.all([
      this.productRepository.find({
        where: { id: In(_.map(skus, (i) => i.productId)) },
      }),
      this.tenantRepository.findOneBy({
        id: getCurrentTenantOrThrow().tenantId,
      }),
    ]);
    const imageList = await this.imageRepository.find({
      where: { id: In(_.map(productList, (i) => i.imageId)) },
    });

    const productMap = _.keyBy(productList, 'id');
    const imageMap = _.keyBy(imageList, 'id');
    const skuMap = _.groupBy(skus, 'productId');
    const countMap = _.keyBy(products, 'skuCode');

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('quotation');

    // 全局变量，设置当前行和图片的宽度
    let currentRow = 1;
    let minRowHeight = 25;

    // 设置公司信息并更新当前所在行
    currentRow = this.setCompanyInfo(sheet, { currentRow, tenantInfo });

    // 设置表头
    currentRow = this.setHeader(sheet, currentRow);

    const startRow = currentRow;
    currentRow = this.setTableContent(sheet, workbook, {
      currentRow,
      skuMap,
      productMap,
      imageMap,
      countMap,
      minRowHeight,
    });

    currentRow = this.setTotalPrice(sheet, currentRow, startRow, minRowHeight);

    currentRow = this.setBankInfo(sheet, currentRow, tenantInfo);
    // 如果还有后续操作，这里的 currentRow 可以继续使用

    // 设置表格样式
    this.setSheetStyle(sheet);

    // 设置单元格边框
    this.setHoleBorder(sheet);

    return workbook.xlsx.writeBuffer();

    // await workbook.xlsx.writeFile('src/temp/quote.xlsx');

    // child_process.exec(`start "" "${path.resolve('src/temp/quote.xlsx')}"`);

    // return skuMap;
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
      { key: 'desc', width: 25 },
      { key: 'size', width: 25 },
      { key: 'qty', width: 15 },
      { key: 'unitPrice', width: 25 },
      { key: 'totalPrice', width: 25 },
      { key: 'totalWeight', width: 25 },
      { key: 'totalCBM', width: 25 },
      { key: 'logo', width: 25 },
      { key: 'cost', width: 25 },
    ];

    const headers = [
      'PICTURE',
      'ITEM No.',
      'ITEM NAME',
      'Size',
      'QTY',
      'UNIT PRICE',
      'TOTAL PRICE(USD)',
      'TOTAL N.W.(KGS)',
      'MEAS.(CBM)',
      'LOGO',
      '成本(核算)',
    ];
    const headerRow = sheet.getRow(currentRow);
    sheet.columns.forEach((_, idx) => {
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
        name: 'Times New Roman',
        size: 12,
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
    sheet.mergeCells('A1:D4');
    sheet.getCell('A1').value = tenantInfo?.name;
    sheet.getCell('A1').alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };
    sheet.getCell('A1').font = {
      name: 'Times New Roman',
      bold: true,
      size: 26,
    };
    // 发票信息标签（E 列）
    sheet.mergeCells('E1:F1');
    sheet.mergeCells('E2:F2');
    sheet.mergeCells('E3:F3');
    sheet.mergeCells('E4:F4');
    sheet.getCell('E1').value = 'INVOICE NO:';
    sheet.getCell('E2').value = 'REVISION:';
    sheet.getCell('E3').value = 'INVOICE DATE:';
    sheet.getCell('E4').value = 'TO:';
    ['E1', 'E2', 'E3', 'E4'].forEach((cell) => {
      sheet.getCell(cell).alignment = {
        vertical: 'middle',
        horizontal: 'center',
      };
      sheet.getCell(cell).font = {
        name: 'Times New Roman',
        bold: true,
        size: 12,
      };
    });
    // 发票信息（G 列到 J 列）
    sheet.mergeCells('G1:J1');
    sheet.mergeCells('G2:J2');
    sheet.mergeCells('G3:J3');
    sheet.mergeCells('G4:J4');
    sheet.getCell('G1').value = this.utilService.generateInvoiceNo();
    sheet.getCell('G2').value = '0';
    sheet.getCell('G3').value = moment().format('YYYY/M/D');
    sheet.getCell('G4').value =
      `Sold To / Importer:FOCUS COMERCIAL IMPORTADORA E EXPORTADORA LTDA\nRUA LAURO MULLER,NR.567,ROOM 02,CENTER CEP88301-400,ITAJAISC-BRAZI CNP]11.234.477/0001-58`;
    // 提示列，需要业务员自己删除，方便做利润控制
    sheet.getCell('K1').value = '此列使用后需删除';
    sheet.getCell('K1').font = {
      color: { argb: 'FFFF0000' }, // 红色字体
      bold: true,
      size: 14,
    };
    ['G1', 'G2', 'G3', 'G4'].forEach((cell) => {
      sheet.getCell(cell).alignment = {
        wrapText: cell === 'G4' ? true : false,
        vertical: 'middle',
        horizontal: 'center',
      };
      sheet.getCell(cell).font = {
        name: 'Times New Roman',
        size: 12,
      };
    });
    sheet.getRow(currentRow).height = 21;
    sheet.getRow(currentRow + 1).height = 21;
    sheet.getRow(currentRow + 2).height = 21;
    sheet.getRow(currentRow + 3).height = 81;

    // 第二次合并
    // 电话、传真、ATTN
    sheet.mergeCells('A5:D5');
    sheet.mergeCells('E5:F5');
    sheet.mergeCells('G5:J5');
    sheet.getCell('A5').value = {
      text: `Tel: ${tenantInfo?.tel}  FAX: ${tenantInfo?.fax}`,
      hyperlink: `tel:${tenantInfo?.tel}`,
    };
    sheet.getCell('A5').alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };
    sheet.getCell('A5').font = {
      name: 'Times New Roman',
      size: 12,
      underline: 'single',
      color: { argb: 'FF0000ff' },
    };
    sheet.getCell('E5').value = 'ATTN:';
    ['E5'].forEach((cell) => {
      sheet.getCell(cell).alignment = {
        vertical: 'middle',
        horizontal: 'center',
      };
      sheet.getCell(cell).font = {
        name: 'Times New Roman',
        bold: true,
        size: 12,
      };
    });
    sheet.getCell('G5').value =
      `Ship To /Customer:ROPE STORE LTDA\nADD:RUA JOSE PEREIRA LIBERATO,1710,GALPAO 5,SAO JOAO-CITY:ITAJAI-SC CEP:88.304-401CNPJ:194370650001-27`;
    sheet.getCell('G5').alignment = {
      wrapText: true,
      vertical: 'middle',
      horizontal: 'center',
    };
    sheet.getCell('G5').font = {
      name: 'Times New Roman',
      size: 12,
    };
    sheet.getRow(currentRow + 4).height = 81;

    // 第三次合并
    sheet.mergeCells('A6:D7');
    sheet.mergeCells('A8:D9');
    sheet.mergeCells('E6:F6');
    sheet.mergeCells('E7:F7');
    sheet.mergeCells('E8:F8');
    sheet.mergeCells('E9:F9');
    sheet.getCell('A6').value = tenantInfo?.address;
    sheet.getCell('A6').alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };
    sheet.getCell('A6').font = { name: 'Times New Roman', size: 12 };
    sheet.getCell('A8').value = 'PROFORMA INVOICE';
    sheet.getCell('A8').alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };
    sheet.getCell('A8').font = {
      name: 'Times New Roman',
      bold: true,
      size: 22,
    };
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
        name: 'Times New Roman',
        bold: true,
        size: 12,
      };
    });
    sheet.mergeCells('G6:J6');
    sheet.mergeCells('G7:J7');
    sheet.mergeCells('G8:J8');
    sheet.mergeCells('G9:J9');
    sheet.getCell('G6').value = 'FOB NANTONG';
    sheet.getCell('G7').value = '30%+70%T/T';
    sheet.getCell('G8').value = 'Nantong, China';
    sheet.getCell('G9').value = '请填写目的地的';
    ['G6', 'G7', 'G8', 'G9'].forEach((cell) => {
      sheet.getCell(cell).alignment = {
        vertical: 'middle',
        horizontal: 'center',
      };
      sheet.getCell(cell).font = {
        color: cell === 'G6' ? { argb: 'FF00b0f0' } : { argb: 'FF000000' },
        name: 'Times New Roman',
        size: 12,
      };
    });
    _.forEach([6, 7, 8, 9], (i) => {
      sheet.getRow(i).height = 21;
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

  private setHoleBorder(sheet: ExcelJS.Worksheet) {
    const rows = sheet.lastRow?.number ?? 1;
    const cols = sheet.columnCount || 1;

    const border = {
      style: 'thin',
      color: { argb: 'FF000000' }, // 纯黑色
    } as const;

    for (let r = 1; r <= rows; r++) {
      const row = sheet.getRow(r);
      for (let c = 1; c <= cols; c++) {
        const cell = row.getCell(c);
        cell.border = {
          top: border,
          bottom: border,
          left: border,
          right: border,
        };
      }
    }
  }

  private setTableContent(
    sheet: ExcelJS.Worksheet,
    workbook: ExcelJS.Workbook,
    {
      productMap,
      skuMap,
      countMap,
      imageMap,
      currentRow,
      minRowHeight,
    }: {
      productMap: Record<string, ProductEntity>;
      skuMap: Record<string, SKUEntity[]>;
      imageMap: Record<string, ImageEntity>;
      countMap: Record<string, ProductItemDto>;
      currentRow: number;
      minRowHeight: number;
    },
  ): number {
    for (const productId of Object.keys(skuMap)) {
      // 产品信息、sku信息
      const productInfo = productMap[productId];
      const skus = skuMap[productId];
      const imageId = productMap[productId].imageId;

      const rowHeight = skus.length === 1 ? minRowHeight * 2 : minRowHeight;
      const pictureStartRow = currentRow;
      const pictureEndRow = currentRow + skus.length - 1;

      for (const sku of skus) {
        const row = sheet.getRow(currentRow);
        row.height = rowHeight;
        row.font = {
          name: 'Verdana Regular',
          size: 11,
        };
        row.alignment = { vertical: 'middle', horizontal: 'center' };

        row.getCell('size').value =
          sku.pricingType === PricingType.PriceByAttribute
            ? Number(sku.attributeValue)
            : sku.desc || productInfo.desc;
        if (sku.pricingType === PricingType.PriceByAttribute) {
          row.getCell('size').numFmt = `General" ${sku.unit}"`;
        }

        row.getCell('qty').value = countMap[sku.skuCode].quantity;
        row.getCell('qty').numFmt = '0 "pcs"';

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
              ? `D${currentRow}*E${currentRow}*F${currentRow}`
              : `E${currentRow}*F${currentRow}`,
        };
        row.getCell('totalPrice').numFmt = '"$"#,##0.00;-"$"#,##0.00';

        // 计算单行重量
        row.getCell('totalWeight').value = {
          formula: `E${currentRow}*${sku.weight}`,
        };
        row.getCell('totalWeight').numFmt = 'General" kg"';

        currentRow++;
      }

      // 合并一些需要合并的单元格
      if (skus.length > 1) {
        // 合并image
        sheet.mergeCells(`A${pictureStartRow}:A${pictureEndRow}`);
        // 合并item no
        sheet.mergeCells(`B${pictureStartRow}:B${pictureEndRow}`);
        // 合并item name
        sheet.mergeCells(`C${pictureStartRow}:C${pictureEndRow}`);
        // 合并CBM，业务员自己计算
        sheet.mergeCells(`I${pictureStartRow}:I${pictureEndRow}`);
        // 合并LOGO
        sheet.mergeCells(`J${pictureStartRow}:J${pictureEndRow}`);
      }

      // 写入 item no
      sheet.getCell(`B${pictureStartRow}`).value = productInfo.name;
      sheet.getCell(`B${pictureStartRow}`).alignment = {
        vertical: 'middle',
        horizontal: 'center',
      };
      // 写入 item desc
      sheet.getCell(`C${pictureStartRow}`).value = productInfo.desc;
      sheet.getCell(`C${pictureStartRow}`).alignment = {
        vertical: 'middle',
        horizontal: 'center',
      };
      // cbm不写，只居中
      sheet.getCell(`I${pictureStartRow}`).alignment = {
        vertical: 'middle',
        horizontal: 'center',
      };
      // logo不写，只居中
      sheet.getCell(`J${pictureStartRow}`).alignment = {
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
              9525 * Math.floor((rowHeight * skus.length * 1.33 - height) / 2),
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
    return currentRow;
  }

  private setTotalPrice(
    sheet: ExcelJS.Worksheet,
    currentRow: number,
    startRow: number,
    minRowHeight: number,
  ) {
    let row = sheet.getRow(currentRow);
    row.height = minRowHeight;
    row.font = {
      name: 'Verdana Regular',
      size: 11,
    };
    row.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.mergeCells(`A${currentRow}:F${currentRow}`);
    sheet.getCell(`A${currentRow}`).value = 'FOB PRICE:';
    row.getCell('totalPrice').value = 550;
    row.getCell('totalPrice').numFmt = '"$"#,##0.00;-"$"#,##0.00';

    currentRow++;
    row = sheet.getRow(currentRow);
    row.height = minRowHeight;
    row.font = {
      name: 'Verdana Regular',
      size: 11,
    };
    row.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.mergeCells(`A${currentRow}:F${currentRow}`);
    sheet.getCell(`A${currentRow}`).value = 'TOTAL:';
    const totalCell = row.getCell('totalPrice');
    totalCell.value = {
      formula: `SUM(G${startRow}:G${currentRow - 1})`,
    };
    totalCell.numFmt = '"$"#,##0.00;-"$"#,##0.00';
    const totalWeightCell = row.getCell('totalWeight');
    totalWeightCell.value = {
      formula: `SUM(H${startRow}:H${currentRow - 1})`,
    };
    totalWeightCell.numFmt = 'General" kg"';
    const totalCBMCell = row.getCell('totalCBM');
    totalCBMCell.value = {
      formula: `SUM(I${startRow}:I${currentRow - 1})`,
    };
    totalCBMCell.numFmt = 'General" cbm"';

    currentRow++;
    row = sheet.getRow(currentRow);
    row.height = minRowHeight;
    row.font = {
      name: 'Verdana Regular',
      size: 11,
    };
    row.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.mergeCells(`A${currentRow}:F${currentRow}`);
    sheet.getCell(`A${currentRow}`).value = '30% deposite:';
    const depositCell = row.getCell('totalPrice');
    depositCell.value = {
      formula: `${totalCell.address}*0.3`,
    };
    depositCell.numFmt = '"$"#,##0.00;-"$"#,##0.00';

    currentRow++;
    row = sheet.getRow(currentRow);
    row.height = minRowHeight;
    row.font = {
      name: 'Verdana Regular',
      size: 11,
    };
    row.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.mergeCells(`A${currentRow}:F${currentRow}`);
    sheet.getCell(`A${currentRow}`).value = '70% balance:';
    const balanceCell = row.getCell('totalPrice');
    balanceCell.value = {
      formula: `${totalCell.address}*0.7`,
    };
    balanceCell.numFmt = '"$"#,##0.00;-"$"#,##0.00';
    return currentRow + 1;
  }

  private setBankInfo(
    sheet: ExcelJS.Worksheet,
    currentRow: number,
    tenantInfo: TenantEntity | null,
  ) {
    const rowHeight = 20;
    sheet.mergeCells(`A${currentRow}:K${currentRow}`);
    sheet.getCell(`A${currentRow}`).value = 'Bank Information:';
    let row = sheet.getRow(currentRow);
    row.height = rowHeight;
    row.font = {
      name: 'Times New Roman',
      bold: true,
      size: 10,
      color: { argb: 'FFFFFFFF' },
    };
    row.alignment = { vertical: 'middle', horizontal: 'left' };
    row.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF000000' }, // 黑色背景
    };

    currentRow++;
    const keys = [
      { key: 'Beneficiary', value: tenantInfo?.name },
      { key: 'Address', value: tenantInfo?.shortAddress },
      { key: 'Bank', value: tenantInfo?.bank },
      { key: 'Bank Address', value: tenantInfo?.bankAddress },
      { key: 'SWIFT CODE', value: tenantInfo?.swiftCode },
      { key: 'Account No.', value: tenantInfo?.accountNo },
    ];
    for (const item of keys) {
      sheet.mergeCells(`A${currentRow}:K${currentRow}`);
      sheet.getCell(`A${currentRow}`).value = `${item.key}: ${item.value}`;
      row = sheet.getRow(currentRow);
      row.height = rowHeight;
      row.font = {
        name: 'Times New Roman',
        color: { argb: 'FFff0000' },
        size: 10,
      };
      row.alignment = { vertical: 'middle', horizontal: 'left' };
      currentRow++;
    }

    row = sheet.getRow(currentRow);
    row.height = rowHeight;
    sheet.mergeCells(`A${currentRow}:C${currentRow}`);
    sheet.mergeCells(`D${currentRow}:E${currentRow}`);
    sheet.getCell(`A${currentRow}`).value = 'Buyers:';
    sheet.getCell(`F${currentRow}`).value = 'Sellers:';
    currentRow++;

    row = sheet.getRow(currentRow);
    row.height = rowHeight;
    sheet.mergeCells(`A${currentRow}:B${currentRow}`);
    sheet.mergeCells(`D${currentRow}:E${currentRow}`);
    sheet.getCell(`A${currentRow}`).value = 'Date:';
    sheet.getCell(`F${currentRow}`).value = 'Date:';
    currentRow++;

    row = sheet.getRow(currentRow);
    row.height = rowHeight;
    sheet.mergeCells(`A${currentRow}:B${currentRow}`);
    sheet.mergeCells(`F${currentRow}:H${currentRow}`);
    sheet.getCell(`A${currentRow}`).value = 'AUTHORIZED SIGNATURE';
    sheet.getCell(`F${currentRow}`).value = 'AUTHORIZED SIGNATURE';
    currentRow++;

    return currentRow;
  }
}
