import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('customers')
  getCustomerPayments(@Query('unitId') unitId: string) {
    return this.paymentsService.getCustomerPayments(unitId);
  }

  @Get('vendors')
  getVendorPayments(@Query('unitId') unitId: string) {
    return this.paymentsService.getVendorPayments(unitId);
  }

  @Get('drivers')
  getDriverEarnings(@Query('unitId') unitId: string) {
    return this.paymentsService.getDriverEarnings(unitId);
  }

  @Post('customers')
  createCustomerPayment(@Body() body: any) {
    return this.paymentsService.createCustomerPayment(body);
  }

  @Post('vendors')
  createVendorPayment(@Body() body: any) {
    return this.paymentsService.createVendorPayment(body);
  }

  @Post('drivers')
  createDriverEarning(@Body() body: any) {
    return this.paymentsService.createDriverEarning(body);
  }
}
