import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { TripsService } from './trips.service';
import { TripsGateway } from './trips.gateway';

@Controller('trips')
export class TripsController {
  constructor(
    private readonly tripsService: TripsService,
    private readonly tripsGateway: TripsGateway,
  ) {}

  @Get()
  findAll(@Query('unitId') unitId: string, @Query('status') status?: string) {
    return this.tripsService.findAll(unitId, status);
  }

  @Post()
  async create(@Body() body: any) {
    const trip = await this.tripsService.create(body);
    this.tripsGateway.emitTripUpdate(trip.order.unitId, { action: 'CREATED', trip });
    return trip;
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'LOADING' | 'IN_TRANSIT' | 'DELIVERED',
    @Body('gpsLink') gpsLink?: string,
  ) {
    const trip = await this.tripsService.updateStatus(id, status, gpsLink);
    this.tripsGateway.emitTripUpdate(trip.order.unitId, { action: 'UPDATED', trip });
    return trip;
  }
}
