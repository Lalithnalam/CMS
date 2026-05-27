import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VendorsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(unitId: string) {
    return this.prisma.vendor.findMany({
      where: { unitId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.vendor.findUnique({
      where: { id },
      include: { purchases: true, payments: true },
    });
  }

  async create(data: any) {
    return this.prisma.vendor.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.vendor.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.vendor.delete({ where: { id } });
  }

  async addPurchase(data: any) {
    const materialWeight = data.grossWeight - data.tareWeight;
    const totalCost = materialWeight * data.rate;
    return this.prisma.vendorPurchase.create({
      data: {
        ...data,
        materialWeight,
        totalCost,
      },
    });
  }

  async addPayment(data: any) {
    return this.prisma.vendorPayment.create({ data });
  }

  async getLedger(vendorId: string) {
    const [purchases, payments] = await Promise.all([
      this.prisma.vendorPurchase.findMany({ where: { vendorId }, orderBy: { date: 'desc' } }),
      this.prisma.vendorPayment.findMany({ where: { vendorId }, orderBy: { date: 'desc' } }),
    ]);

    const totalPurchased = purchases.reduce((sum, p) => sum + p.totalCost, 0);
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const balance = totalPurchased - totalPaid;

    return { purchases, payments, totalPurchased, totalPaid, balance };
  }
}
