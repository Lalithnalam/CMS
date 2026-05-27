import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ProductionService } from './production.service';

@Controller('production')
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Get()
  findAll(@Query('unitId') unitId: string) {
    return this.productionService.findAll(unitId);
  }

  @Post()
  createBatch(@Body() body: any) {
    return this.productionService.createBatch(body);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productionService.findOne(id);
  }
}
