import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductionService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(unitId: string) {
    return this.prisma.productionBatch.findMany({
      where: { unitId },
      include: {
        outputs: { include: { product: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async createBatch(data: {
    unitId: string;
    shift: string;
    rawMaterialUsed: number;
    notes?: string;
    outputs: { productId: string; quantityProduced: number }[];
  }) {
    const totalOutput = data.outputs.reduce((sum, out) => sum + out.quantityProduced, 0);
    const wastage = data.rawMaterialUsed - totalOutput;

    // Start a transaction to create the batch and update product stock
    return this.prisma.$transaction(async (tx) => {
      const batch = await tx.productionBatch.create({
        data: {
          unitId: data.unitId,
          shift: data.shift,
          rawMaterialUsed: data.rawMaterialUsed,
          wastage,
          notes: data.notes,
          outputs: {
            create: data.outputs.map((out) => ({
              productId: out.productId,
              quantityProduced: out.quantityProduced,
            })),
          },
        },
        include: { outputs: true },
      });

      // Update Stock for each produced product
      for (const output of data.outputs) {
        await tx.stock.upsert({
          where: { productId: output.productId },
          update: { quantity: { increment: output.quantityProduced } },
          create: { productId: output.productId, quantity: output.quantityProduced },
        });
      }

      return batch;
    });
  }

  async findOne(id: string) {
    return this.prisma.productionBatch.findUnique({
      where: { id },
      include: { outputs: { include: { product: true } } },
    });
  }
}
