import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WeighbridgeService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(unitId: string, date?: string) {
    const where: any = { unitId };
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      where.date = { gte: start, lt: end };
    }

    return this.prisma.weighbridgeEntry.findMany({
      where,
      include: { product: true },
      orderBy: { date: 'desc' },
    });
  }

  async create(data: {
    unitId: string;
    shift: string;
    vehicleNumber: string;
    driverName: string;
    orderId?: string;
    productId: string;
    weight: number;
    rate: number;
    transportCharge?: number;
    gst?: number;
    paymentType?: 'CASH' | 'BANK_TRANSFER' | 'CREDIT';
  }) {
    const materialAmount = data.weight * data.rate;
    return this.prisma.weighbridgeEntry.create({
      data: {
        ...data,
        materialAmount,
        transportCharge: data.transportCharge || 0,
        gst: data.gst || 0,
      },
      include: { product: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.weighbridgeEntry.findUnique({
      where: { id },
      include: { product: true },
    });
  }

  async getDailySummary(unitId: string, date: string) {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);

    const entries = await this.prisma.weighbridgeEntry.findMany({
      where: { unitId, date: { gte: start, lt: end } },
      include: { product: true },
    });

    const totalWeight = entries.reduce((sum, e) => sum + e.weight, 0);
    const totalAmount = entries.reduce((sum, e) => sum + e.materialAmount, 0);
    const totalTransport = entries.reduce((sum, e) => sum + e.transportCharge, 0);

    return {
      date,
      entryCount: entries.length,
      totalWeight,
      totalAmount,
      totalTransport,
      entries,
    };
  }
}
