import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CustomersModule } from './customers/customers.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { TransportModule } from './transport/transport.module';
import { WeighbridgeModule } from './weighbridge/weighbridge.module';

import { UsersModule } from './users/users.module';
import { VendorsModule } from './vendors/vendors.module';
import { ProductionModule } from './production/production.module';
import { TripsModule } from './trips/trips.module';
import { PaymentsModule } from './payments/payments.module';
import { ChallansModule } from './challans/challans.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    VendorsModule,
    ProductionModule,
    TripsModule,
    PaymentsModule,
    ChallansModule,
    NotificationsModule,
    ReportsModule,
    CustomersModule,
    ProductsModule,
    OrdersModule,
    TransportModule,
    WeighbridgeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
