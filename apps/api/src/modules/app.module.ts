import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { ItemsModule } from './items/items.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { WarehousesModule } from './warehouses/warehouses.module.js';
import { SuppliersModule } from './suppliers/suppliers.module.js';
import { StockInsModule } from './stock-ins/stock-ins.module.js';
import { StockOutsModule } from './stock-outs/stock-outs.module.js';
import { StocksModule } from './stocks/stocks.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { ttl: parseInt(process.env.RATE_LIMIT_TTL || '60'), limit: parseInt(process.env.RATE_LIMIT_LIMIT || '100') },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    ItemsModule,
    CategoriesModule,
    WarehousesModule,
    SuppliersModule,
    StockInsModule,
    StockOutsModule,
    StocksModule,
  ],
})
export class AppModule {}
