import { Controller, Post, Get, Param, Query } from '@nestjs/common';
import { ChallansService } from './challans.service';

@Controller('challans')
export class ChallansController {
  constructor(private readonly challansService: ChallansService) {}

  @Post('generate/:tripId')
  generateChallan(@Param('tripId') tripId: string) {
    return this.challansService.generateChallanForTrip(tripId);
  }

  @Get('order/:orderId')
  getByOrder(@Param('orderId') orderId: string) {
    return this.challansService.getChallansByOrder(orderId);
  }
}
