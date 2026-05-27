import { Module } from '@nestjs/common';
import { VehiclesController, DriversController } from './transport.controller';
import { VehiclesService, DriversService } from './transport.service';

@Module({
  controllers: [VehiclesController, DriversController],
  providers: [VehiclesService, DriversService],
  exports: [VehiclesService, DriversService],
})
export class TransportModule {}
