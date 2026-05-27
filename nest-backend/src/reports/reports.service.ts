import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(unitId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [orders, weighbridges, production, payments] = await Promise.all([
      this.prisma.order.count({ where: { unitId, createdAt: { gte: today } } }),
      this.prisma.weighbridgeEntry.count({ where: { unitId, date: { gte: today } } }),
      this.prisma.productionBatch.aggregate({
        where: { unitId, date: { gte: today } },
        _sum: { rawMaterialUsed: true },
      }),
      this.prisma.customerPayment.aggregate({
        where: { customer: { unitId }, date: { gte: today } },
        _sum: { amount: true },
      })
    ]);

    return {
      todayOrders: orders,
      todayWeighbridgeEntries: weighbridges,
      todayProduction: production._sum.rawMaterialUsed || 0,
      todayCollections: payments._sum.amount || 0,
    };
  }

  async getSalesData(unitId: string) {
    // Mocking 7 days of sales data for the chart
    const days = 7;
    const data = [];
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      data.push({
        date: d.toLocaleDateString(),
        sales: Math.floor(Math.random() * 50000) + 10000, // Mock value
      });
    }
    return data.reverse();
  }
}
