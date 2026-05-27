import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TripsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(unitId: string, status?: string) {
    const where: any = { order: { unitId } };
    if (status) where.status = status;

    return this.prisma.trip.findMany({
      where,
      include: {
        order: { include: { customer: true, items: { include: { product: true } } } },
        vehicle: true,
        driver: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: {
    orderId: string;
    vehicleId: string;
    driverId: string;
    tripNumber: number;
    status: 'LOADING' | 'IN_TRANSIT' | 'DELIVERED';
  }) {
    return this.prisma.trip.create({
      data: {
        orderId: data.orderId,
        vehicleId: data.vehicleId,
        driverId: data.driverId,
        tripNumber: data.tripNumber,
        status: data.status,
      },
      include: {
        order: { include: { customer: true, items: { include: { product: true } } } },
        vehicle: true,
        driver: true,
      },
    });
  }

  async updateStatus(id: string, status: 'LOADING' | 'IN_TRANSIT' | 'DELIVERED', gpsLink?: string) {
    const data: any = { status };
    if (status === 'IN_TRANSIT') data.dispatchedAt = new Date();
    if (status === 'DELIVERED') data.deliveredAt = new Date();
    if (gpsLink) data.gpsLink = gpsLink;

    return this.prisma.trip.update({
      where: { id },
      data,
      include: {
        order: { include: { customer: true } },
        vehicle: true,
        driver: true,
      },
    });
  }
}
