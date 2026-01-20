import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository, Like } from 'typeorm';
import { ProductEntity, SKUEntity } from '@/database/entities';
import { UtilService } from '@/modules/global/util/services/util.service';
import { BusinessErrorHelper } from '@/common';
import { ListSkuDto } from '../dto/list-sku.dto';
import _ from 'lodash';
import { PricingType, PricingImportType } from '@/constants';
import { getCurrentCtx } from '@/common/context/request-context';

@Injectable()
export class SKUService {
  constructor(
    @InjectRepository(SKUEntity)
    private readonly skuRepository: Repository<SKUEntity>,

    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,

    private readonly utilService: UtilService,
  ) {}

  // async createSku(user: UserInfo, dto: CreateSkuDto) {
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
      .innerJoinAndSelect('product.image', 'image')
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
        image: `data:image/png;base64,${i.product.image.base64Data}`,
        createTime: i.createTime,
      })),
      total,
      currentPage: dto.pageIndex,
      pageSize: dto.pageSize,
    };
  }

  // async findOneSku(user: UserInfo, skuId: string) {
  //   const sku = await this.skuRepository.findOne({
  //     where: {
  //       id: skuId,
  //       tenantId: user.tenantId,
  //     },
  //     relations: ['product'],
  //   });

  //   if (!sku) {
  //     throw BusinessErrorHelper.Platform.skuNotFound();
  //   }

  //   return {
  //     id: sku.id,
  //     skuCode: sku.skuCode,
  //     productId: sku.productId,
  //     productName: sku.product?.name,
  //     pricingType: sku.pricingType,
  //     attributeValue: sku.attributeValue,
  //     desc: sku.desc,
  //     order: sku.order,
  //     unitPrice: sku.unitPrice,
  //     unit: sku.unit,
  //     weight: sku.weight,
  //     length: sku.length,
  //     width: sku.width,
  //     height: sku.height,
  //     status: sku.status,
  //     createTime: sku.createTime,
  //     updateTime: sku.updateTime,
  //   };
  // }

  // async updateSku(user: UserInfo, skuId: string, dto: UpdateSkuDto) {
  //   const sku = await this.skuRepository.findOne({
  //     where: {
  //       id: skuId,
  //       tenantId: user.tenantId,
  //     },
  //   });

  //   if (!sku) {
  //     throw BusinessErrorHelper.Platform.skuNotFound();
  //   }

  //   // 如果更新了SKU编码，检查是否与其他SKU冲突
  //   if (dto.skuCode && dto.skuCode !== sku.skuCode) {
  //     const existingSku = await this.skuRepository.findOne({
  //       where: {
  //         tenantId: user.tenantId,
  //         skuCode: dto.skuCode,
  //         id: !skuId, // 排除当前SKU
  //       },
  //     });

  //     if (existingSku) {
  //       throw BusinessErrorHelper.Platform.skuAlreadyExists();
  //     }
  //   }

  //   // 如果更新了产品ID，检查产品是否存在
  //   if (dto.productId) {
  //     const product = await this.productRepository.findOne({
  //       where: {
  //         id: dto.productId,
  //         tenantId: user.tenantId,
  //       },
  //     });

  //     if (!product) {
  //       throw BusinessErrorHelper.Platform.productNotFound();
  //     }
  //   }

  //   Object.assign(sku, dto);
  //   const updatedSku = await this.skuRepository.save(sku);

  //   return {
  //     id: updatedSku.id,
  //     skuCode: updatedSku.skuCode,
  //     message: 'SKU updated successfully',
  //   };
  // }

  // async removeSku(user: UserInfo, skuCode: string) {
  //   const sku = await this.skuRepository.findOne({
  //     where: {
  //       skuCode,
  //       tenantId: user.tenantId,
  //     },
  //   });

  //   if (!sku) {
  //     throw BusinessErrorHelper.Platform.skuNotFound();
  //   }

  //   await this.skuRepository.remove(sku);

  //   return {
  //     skuCode,
  //     message: 'SKU deleted successfully',
  //   };
  // }

  // async listSkuByProduct(user: UserInfo, productId: string) {
  //   const skus = await this.skuRepository.find({
  //     where: {
  //       tenantId: user.tenantId,
  //       productId,
  //       status: 1, // 只返回有效的SKU
  //     },
  //     order: { order: 'ASC' },
  //   });

  //   return {
  //     list: skus.map((sku) => ({
  //       id: sku.id,
  //       skuCode: sku.skuCode,
  //       desc: sku.desc,
  //       unitPrice: sku.unitPrice,
  //       unit: sku.unit,
  //       weight: sku.weight,
  //       status: sku.status,
  //     })),
  //   };
  // }
}
