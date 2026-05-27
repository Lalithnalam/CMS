import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChallansService {
  constructor(private readonly prisma: PrismaService) {}

  async generateChallanForTrip(tripId: string) {
    // 1. Fetch data
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        order: { include: { customer: true, items: { include: { product: true } } } },
        vehicle: true,
        driver: true,
      },
    });

    if (!trip) throw new Error('Trip not found');

    const challanNumber = `CHL-${Date.now()}`;

    // PDF Generation and Supabase upload bypassed due to environment constraints.
    // In production, you would use Puppeteer to generate a PDF and upload to Supabase here.
    
    const pdfUrl = `https://mock-storage.example.com/challans/${challanNumber}.pdf`;

    // 5. Save to DB
    return this.prisma.challan.create({
      data: {
        tripId,
        orderId: trip.orderId,
        challanNumber,
        pdfUrl,
      },
    });
  }

  async getChallansByOrder(orderId: string) {
    return this.prisma.challan.findMany({ where: { orderId } });
  }
}
