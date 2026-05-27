import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(unitId: string) {
    return this.prisma.customer.findMany({
      where: { unitId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.customer.findUnique({ where: { id } });
  }

  async create(data: {
    name: string;
    phone: string;
    address: string;
    creditLimit?: number;
    unitId: string;
  }) {
    return this.prisma.customer.create({ data });
  }

  async update(id: string, data: Partial<{
    name: string;
    phone: string;
    address: string;
    creditLimit: number;
    isActive: boolean;
  }>) {
    return this.prisma.customer.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.customer.delete({ where: { id } });
  }

  async getLedger(customerId: string) {
    const [orders, payments] = await Promise.all([
      this.prisma.order.findMany({
        where: { customerId },
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.customerPayment.findMany({
        where: { customerId },
        orderBy: { date: 'desc' },
      }),
    ]);

    const totalBilled = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const balance = totalBilled - totalPaid;

    return { orders, payments, totalBilled, totalPaid, balance };
  }
}
