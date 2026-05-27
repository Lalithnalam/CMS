import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(unitId: string, status?: string) {
    const where: any = { unitId };
    if (status) where.status = status;

    return this.prisma.order.findMany({
      where,
      include: {
        customer: true,
        items: { include: { product: true } },
        trips: { include: { vehicle: true, driver: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: { include: { product: true } },
        trips: { include: { vehicle: true, driver: true } },
        payments: true,
      },
    });
  }

  async create(data: {
    customerId: string;
    unitId: string;
    deliveryLocation: string;
    notes?: string;
    items: { productId: string; quantity: number; rate: number }[];
  }) {
    const totalAmount = data.items.reduce((sum, item) => sum + item.quantity * item.rate, 0);

    // Credit Check Logic (Step 7)
    const customer = await this.prisma.customer.findUnique({ where: { id: data.customerId } });
    if (!customer) throw new Error('Customer not found');
    
    // If it's not a cash customer, check credit limit against current balance (if implemented)
    // For now, if current balance + totalAmount > creditLimit, we should block it.
    // Assuming balance is tracked via ledgers, we'll do a simple check on a hypothetical balance field, 
    // or we can calculate the ledger balance on the fly.
    const ledger = await this.prisma.customerPayment.findMany({ where: { customerId: data.customerId } });
    const orders = await this.prisma.order.findMany({ where: { customerId: data.customerId } });
    
    const totalOrdered = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalPaid = ledger.reduce((sum, p) => sum + p.amount, 0);
    const currentBalance = totalOrdered - totalPaid;

    if (currentBalance + totalAmount > customer.creditLimit) {
      throw new Error(`Credit limit exceeded. Limit: ${customer.creditLimit}, Current Balance: ${currentBalance}, Order Value: ${totalAmount}`);
    }

    return this.prisma.order.create({
      data: {
        customerId: data.customerId,
        unitId: data.unitId,
        deliveryLocation: data.deliveryLocation,
        notes: data.notes,
        totalAmount,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.quantity * item.rate,
          })),
        },
      },
      include: {
        customer: true,
        items: { include: { product: true } },
      },
    });
  }

  async updateStatus(id: string, status: 'PENDING' | 'CONFIRMED' | 'DISPATCHED' | 'DELIVERED' | 'PAID') {
    const order = await this.prisma.order.findUnique({ where: { id }, include: { items: true } });
    
    return this.prisma.$transaction(async (tx) => {
      // If status changes to DISPATCHED, decrement stock
      if (status === 'DISPATCHED' && order?.status !== 'DISPATCHED') {
        for (const item of order.items) {
          await tx.stock.update({
            where: { productId: item.productId },
            data: { quantity: { decrement: item.quantity } }
          }).catch(() => {
            // If stock doesn't exist, we might want to log or handle it, but ignoring for pure CRUD.
          });
        }
      }

      return tx.order.update({
        where: { id },
        data: { status },
      });
    });
  }

  async delete(id: string) {
    await this.prisma.orderItem.deleteMany({ where: { orderId: id } });
    return this.prisma.order.delete({ where: { id } });
  }
}
