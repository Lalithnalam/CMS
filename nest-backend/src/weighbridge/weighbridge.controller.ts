import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { WeighbridgeService } from './weighbridge.service';

@Controller('weighbridge')
export class WeighbridgeController {
  constructor(private readonly weighbridgeService: WeighbridgeService) {}

  @Get()
  findAll(@Query('unitId') unitId: string, @Query('date') date?: string) {
    return this.weighbridgeService.findAll(unitId, date);
  }

  @Get('summary')
  getDailySummary(@Query('unitId') unitId: string, @Query('date') date: string) {
    return this.weighbridgeService.getDailySummary(unitId, date);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.weighbridgeService.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.weighbridgeService.create(body);
  }
}
