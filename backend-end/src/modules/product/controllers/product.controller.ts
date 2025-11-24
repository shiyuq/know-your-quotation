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
import { ListProductDto } from '../dto/list-product.dto';

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

  @Post('list')
  @Permisson(PermissonEnum.listProductSku)
  listProductSku(@Request() req: any, @Body() dto: ListProductDto) {
    return this.productService.listProductSku(req.user, dto);
  }
}
