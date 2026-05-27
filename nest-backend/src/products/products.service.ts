import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(unitId: string) {
    return this.prisma.product.findMany({
      where: { unitId },
      include: { stock: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { stock: true },
    });
  }

  async create(data: {
    name: string;
    description?: string;
    unitType?: 'TON' | 'LOAD';
    pricePerUnit: number;
    unitId: string;
  }) {
    const product = await this.prisma.product.create({ data });
    // Auto-create stock entry
    await this.prisma.stock.create({
      data: { productId: product.id, quantity: 0 },
    });
    return this.findOne(product.id);
  }

  async update(id: string, data: Partial<{
    name: string;
    description: string;
    unitType: 'TON' | 'LOAD';
    pricePerUnit: number;
  }>) {
    return this.prisma.product.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.prisma.stock.deleteMany({ where: { productId: id } });
    return this.prisma.product.delete({ where: { id } });
  }

  async updateStock(productId: string, quantity: number) {
    return this.prisma.stock.upsert({
      where: { productId },
      update: { quantity },
      create: { productId, quantity },
    });
  }
}
