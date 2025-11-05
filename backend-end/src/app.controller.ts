import { Controller, Get } from '@nestjs/common';

import { Public } from '@/common';

@Controller()
export class AppController {
  @Public()
  @Get()
  root() {
    return 'hello world111';
  }
}
