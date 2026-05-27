import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(@Query('unitId') unitId: string, @Query('status') status?: string) {
    return this.ordersService.findAll(unitId, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post()
  create(@Body() body: {
    customerId: string;
    unitId: string;
    deliveryLocation: string;
    notes?: string;
    items: { productId: string; quantity: number; rate: number }[];
  }) {
    return this.ordersService.create(body);
  }

  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: 'PENDING' | 'CONFIRMED' | 'DISPATCHED' | 'DELIVERED' | 'PAID' }) {
    return this.ordersService.updateStatus(id, body.status);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.ordersService.delete(id);
  }
}
