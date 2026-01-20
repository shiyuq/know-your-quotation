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
import { Permisson, Cached, BusinessErrorHelper } from '@/common';
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
  @Permisson({ permission: PermissonEnum.leadinProduct })
  @UseInterceptors(FileInterceptor('file'))
  leadinProduct(
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
    return this.productService.leadinProduct(file.buffer);
  }

  @Post('list-sku')
  @Permisson({ permission: PermissonEnum.listProductSku })
  listAllSku(@Body() dto: ListProductSkuDto) {
    return this.productService.listProductSku(dto);
  }

  @Post('list')
  @Permisson({ permission: PermissonEnum.listProduct })
  // @Cached({
  //   key: ({ body }) => `listProduct:${body.productNo}`,
  // })
  listProduct(@Body() dto: ListProductDto) {
    return this.productService.listProduct(dto);
  }

  @Post('sku')
  @Permisson({ permission: PermissonEnum.listSku })
  listProductSku(@Body() dto: ListSkuDto) {
    return this.productService.listSku(dto);
  }

  @Post('delete-sku')
  @Permisson({ permission: PermissonEnum.deleteSku })
  deleteSku(@Body() dto: DeleteSkuDto) {
    return this.productService.deleteSku(dto);
  }

  @Post('offline-sku')
  @Permisson({ permission: PermissonEnum.offlineSku })
  offlineSku(@Body() dto: DeleteSkuDto) {
    return this.productService.offlineSku(dto);
  }
}
