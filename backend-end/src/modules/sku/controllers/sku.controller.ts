import { Body, Request, Controller, Post } from '@nestjs/common';
import { Permisson } from '@/common';
import { PermissonEnum, GlobalRole } from '@/constants';
import { SKUService } from '../services/sku.service';
import { ListSkuDto } from '../dto/list-sku.dto';

@Controller('sku')
export class SKUController {
  constructor(private readonly skuService: SKUService) {}

  @Post('list')
  @Permisson(PermissonEnum.listSku)
  listSku(@Body() dto: ListSkuDto) {
    return this.skuService.listSku(dto);
  }

  // @Post('list')
  // @Permisson(PermissonEnum.listProduct)
  // // @Cached({
  // //   key: ({ body }) => `listProduct:${body.productNo}`,
  // // })
  // listProduct(@Request() req: any, @Body() dto: ListProductDto) {
  //   return this.productService.listProduct(req.user, dto);
  // }

  // @Post('sku')
  // @Permisson(PermissonEnum.listSku)
  // listProductSku(@Request() req: any, @Body() dto: ListSkuDto) {
  //   return this.productService.listSku(req.user, dto);
  // }

  // @Post('delete-sku')
  // @Permisson(PermissonEnum.deleteSku)
  // deleteSku(@Request() req: any, @Body() dto: DeleteSkuDto) {
  //   return this.productService.deleteSku(req.user, dto);
  // }

  // @Post('offline-sku')
  // @Permisson(PermissonEnum.offlineSku)
  // offlineSku(@Request() req: any, @Body() dto: DeleteSkuDto) {
  //   return this.productService.offlineSku(req.user, dto);
  // }
}
