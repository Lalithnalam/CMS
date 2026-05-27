import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard-stats')
  getDashboardStats(@Query('unitId') unitId: string) {
    return this.reportsService.getDashboardStats(unitId);
  }

  @Get('sales-data')
  getSalesData(@Query('unitId') unitId: string) {
    return this.reportsService.getSalesData(unitId);
  }
}
