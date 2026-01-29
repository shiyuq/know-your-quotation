import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { SKUEntity } from '@/database/entities';
import { BusinessErrorHelper } from '@/common';
import { ListSkuDto } from '../dto/list-sku.dto';
import { DetailSkuDto } from '../dto/detail-sku.dto';
import _ from 'lodash';
import { ProductStatus, PricingType, PricingImportType } from '@/constants';
import { SKURepository } from '@/database/repository/sku.repository';

@Injectable()
export class SKUService {
  constructor(
    @InjectRepository(SKUEntity)
    private readonly skuRepository: SKURepository,
  ) {}

  async listSku(dto: ListSkuDto) {
    const [list, total] = await this.skuRepository.getSkuListByPagination(dto);
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
        createTime: i.createTime,
      })),
      total,
      currentPage: dto.pageIndex,
      pageSize: dto.pageSize,
    };
  }

  async getSku(dto: DetailSkuDto) {
    const sku = await this.skuRepository.findOne({ where: { id: dto.id } });
    if (!sku) throw BusinessErrorHelper.Platform.skuNotFound();
    return sku;
  }

  async manageSku(dto: DetailSkuDto) {
    const sku = await this.skuRepository.findOne({ where: { id: dto.id } });
    if (!sku) throw BusinessErrorHelper.Platform.skuNotFound();
    sku.status =
      sku.status === ProductStatus.Valid
        ? ProductStatus.InValid
        : ProductStatus.Valid;
    await this.skuRepository.save(sku);
    return true;
  }

  async deleteSku(dto: DetailSkuDto) {
    const sku = await this.skuRepository.findOne({ where: { id: dto.id } });
    if (!sku) throw BusinessErrorHelper.Platform.skuNotFound();
    await this.skuRepository.delete(dto.id);
    return true;
  }
}
