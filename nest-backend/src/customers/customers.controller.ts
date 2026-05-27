import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { CustomersService } from './customers.service';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  findAll(@Query('unitId') unitId: string) {
    return this.customersService.findAll(unitId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Get(':id/ledger')
  getLedger(@Param('id') id: string) {
    return this.customersService.getLedger(id);
  }

  @Post()
  create(@Body() body: { name: string; phone: string; address: string; creditLimit?: number; unitId: string }) {
    return this.customersService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.customersService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.customersService.delete(id);
  }
}
