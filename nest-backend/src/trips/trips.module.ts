import { Module } from '@nestjs/common';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { TripsGateway } from './trips.gateway';

@Module({
  controllers: [TripsController],
  providers: [TripsService, TripsGateway],
  exports: [TripsService, TripsGateway],
})
export class TripsModule {}
