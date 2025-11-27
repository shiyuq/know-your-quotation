import {
  Body,
  Request,
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Permisson, BusinessErrorHelper } from '@/common';
import { PermissonEnum, GlobalRole } from '@/constants';
import { ProductService } from '../services/product.service';
import { ListProductSkuDto } from '../dto/list-product-sku.dto';
import { ListProductDto } from '../dto/list-product.dto';
import { ListSkuDto } from '../dto/list-sku.dto';
import { DeleteSkuDto } from '../dto/delete-sku.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('leadin')
  @Permisson(PermissonEnum.leadinProduct)
  @UseInterceptors(FileInterceptor('file'))
  leadinProduct(
    @Request() req: any,
    @Body('tenantId') tenantId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 20 * 1 * 1024 * 1024 }), // 20MB
          new FileTypeValidator({
            fileType:
              /(vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet|vnd\.ms-excel|sheet\.macroEnabled\.12)$/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    if (req.user.role === GlobalRole.PLATFORM_ADMIN) {
      if (tenantId) {
        req.user.tenantId = tenantId;
      } else {
        return BusinessErrorHelper.Platform.tenantIdRequired();
      }
    }
    return this.productService.leadinProduct(req.user, file.buffer);
  }

  @Post('list-sku')
  @Permisson(PermissonEnum.listProductSku)
  listAllSku(@Request() req: any, @Body() dto: ListProductSkuDto) {
    return this.productService.listProductSku(req.user, dto);
  }

  @Post('list')
  @Permisson(PermissonEnum.listProduct)
  listProduct(@Request() req: any, @Body() dto: ListProductDto) {
    return this.productService.listProduct(req.user, dto);
  }

  @Post('sku')
  @Permisson(PermissonEnum.listSku)
  listProductSku(@Request() req: any, @Body() dto: ListSkuDto) {
    return this.productService.listSku(req.user, dto);
  }

  @Post('delete-sku')
  @Permisson(PermissonEnum.deleteSku)
  deleteSku(@Request() req: any, @Body() dto: DeleteSkuDto) {
    return this.productService.deleteSku(req.user, dto);
  }

  @Post('offline-sku')
  @Permisson(PermissonEnum.offlineSku)
  offlineSku(@Request() req: any, @Body() dto: DeleteSkuDto) {
    return this.productService.offlineSku(req.user, dto);
  }
}
