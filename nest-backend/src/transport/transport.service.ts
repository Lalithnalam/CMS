import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(unitId: string) {
    return this.prisma.vehicle.findMany({
      where: { unitId },
      include: { driver: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.vehicle.findUnique({
      where: { id },
      include: { driver: true, trips: true },
    });
  }

  async create(data: {
    vehicleNumber: string;
    vehicleType: string;
    capacity: number;
    ownershipType?: 'OWNED' | 'RENTAL';
    rentalRate?: number;
    driverId?: string;
    unitId: string;
  }) {
    return this.prisma.vehicle.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.vehicle.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.vehicle.delete({ where: { id } });
  }
}

@Injectable()
export class DriversService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(unitId: string) {
    return this.prisma.driver.findMany({
      where: { unitId },
      include: { vehicle: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.driver.findUnique({
      where: { id },
      include: { vehicle: true, trips: true, earnings: true },
    });
  }

  async create(data: {
    name: string;
    phone: string;
    paymentType?: 'TRIP_BASED' | 'WEEKLY' | 'MONTHLY';
    rate: number;
    unitId: string;
  }) {
    return this.prisma.driver.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.driver.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.driver.delete({ where: { id } });
  }
}
