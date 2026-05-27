import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { VendorsService } from './vendors.service';

@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Get()
  findAll(@Query('unitId') unitId: string) {
    return this.vendorsService.findAll(unitId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vendorsService.findOne(id);
  }

  @Get(':id/ledger')
  getLedger(@Param('id') id: string) {
    return this.vendorsService.getLedger(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.vendorsService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.vendorsService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.vendorsService.delete(id);
  }

  @Post('purchases')
  addPurchase(@Body() body: any) {
    return this.vendorsService.addPurchase(body);
  }

  @Post('payments')
  addPayment(@Body() body: any) {
    return this.vendorsService.addPayment(body);
  }
}
