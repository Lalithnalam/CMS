import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCustomerPayments(unitId: string) {
    return this.prisma.customerPayment.findMany({
      where: { customer: { unitId } },
      include: { customer: true, order: true },
      orderBy: { date: 'desc' },
    });
  }

  async getVendorPayments(unitId: string) {
    return this.prisma.vendorPayment.findMany({
      where: { vendor: { unitId } },
      include: { vendor: true },
      orderBy: { date: 'desc' },
    });
  }

  async getDriverEarnings(unitId: string) {
    return this.prisma.driverEarning.findMany({
      where: { driver: { unitId } },
      include: { driver: true, trip: true },
      orderBy: { date: 'desc' },
    });
  }

  async createCustomerPayment(data: any) {
    return this.prisma.customerPayment.create({ data });
  }

  async createVendorPayment(data: any) {
    return this.prisma.vendorPayment.create({ data });
  }

  async createDriverEarning(data: any) {
    return this.prisma.driverEarning.create({ data });
  }
}
