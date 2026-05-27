import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { VehiclesService, DriversService } from './transport.service';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  findAll(@Query('unitId') unitId: string) {
    return this.vehiclesService.findAll(unitId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.vehiclesService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.vehiclesService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.vehiclesService.delete(id);
  }
}

@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  findAll(@Query('unitId') unitId: string) {
    return this.driversService.findAll(unitId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.driversService.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.driversService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.driversService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.driversService.delete(id);
  }
}
