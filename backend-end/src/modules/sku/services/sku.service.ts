import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository, Like } from 'typeorm';
import { ProductEntity, SKUEntity } from '@/database/entities';
import { UtilService } from '@/modules/global/util/services/util.service';
import { BusinessErrorHelper } from '@/common';
import { ListSkuDto } from '../dto/list-sku.dto';
import { DetailSkuDto } from '../dto/detail-sku.dto';
import _ from 'lodash';
import { ProductStatus, PricingType, PricingImportType } from '@/constants';
import { getCurrentCtx } from '@/common/context/request-context';

@Injectable()
export class SKUService {
  constructor(
    @InjectRepository(SKUEntity)
    private readonly skuRepository: Repository<SKUEntity>,
  ) {}

  // async createSku(dto: CreateSkuDto) {
  //   // 检查SKU编码是否已存在
  //   const existingSku = await this.skuRepository.findOne({
  //     where: {
  //       tenantId: user.tenantId,
  //       skuCode: dto.skuCode,
  //     },
  //   });

  //   if (existingSku) {
  //     throw BusinessErrorHelper.Platform.skuAlreadyExists();
  //   }

  //   // 检查产品是否存在
  //   const product = await this.productRepository.findOne({
  //     where: {
  //       id: dto.productId,
  //       tenantId: user.tenantId,
  //     },
  //   });

  //   if (!product) {
  //     throw BusinessErrorHelper.Platform.productNotFound();
  //   }

  //   const sku = this.skuRepository.create({
  //     ...dto,
  //     tenantId: user.tenantId,
  //   });

  //   const savedSku = await this.skuRepository.save(sku);

  //   return {
  //     id: savedSku.id,
  //     skuCode: savedSku.skuCode,
  //     message: 'SKU created successfully',
  //   };
  // }

  async listSku(dto: ListSkuDto) {
    const ctx = getCurrentCtx();
    const qb = this.skuRepository
      .createQueryBuilder('sku')
      .innerJoinAndSelect('sku.product', 'product')
      .where('sku.tenantId = :tenantId', { tenantId: ctx.tenant.tenantId });

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
        createTime: i.createTime,
      })),
      total,
      currentPage: dto.pageIndex,
      pageSize: dto.pageSize,
    };
  }

  async getSku(dto: DetailSkuDto) {
    const ctx = getCurrentCtx();
    const sku = await this.skuRepository.findOne({
      where: {
        id: dto.id,
        tenantId: ctx.tenant.tenantId,
      },
    });
    if (!sku) {
      throw BusinessErrorHelper.Platform.skuNotFound();
    }
    return sku;
  }

  async offSellSku(dto: DetailSkuDto) {
    const ctx = getCurrentCtx();
    const sku = await this.skuRepository.findOne({
      where: {
        id: dto.id,
        tenantId: ctx.tenant.tenantId,
      },
    });
    if (!sku) {
      throw BusinessErrorHelper.Platform.skuNotFound();
    }
    await this.skuRepository.update(dto.id, {
      status: ProductStatus.InValid,
    });
    return true;
  }

  async onSellSku(dto: DetailSkuDto) {
    const ctx = getCurrentCtx();
    const sku = await this.skuRepository.findOne({
      where: {
        id: dto.id,
        tenantId: ctx.tenant.tenantId,
      },
    });
    if (!sku) {
      throw BusinessErrorHelper.Platform.skuNotFound();
    }
    await this.skuRepository.update(dto.id, {
      status: ProductStatus.Valid,
    });
    return true;
  }

  async deleteSku(dto: DetailSkuDto) {
    const ctx = getCurrentCtx();
    const sku = await this.skuRepository.findOne({
      where: {
        id: dto.id,
        tenantId: ctx.tenant.tenantId,
      },
    });
    if (!sku) {
      throw BusinessErrorHelper.Platform.skuNotFound();
    }
    await this.skuRepository.delete(dto.id);
    return true;
  }
}
