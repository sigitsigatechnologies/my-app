import { Module } from '@nestjs/common';
import { StockOutsService } from './stock-outs.service';
import { StockOutsController } from './stock-outs.controller';

@Module({
  controllers: [StockOutsController],
  providers: [StockOutsService],
  exports: [StockOutsService],
})
export class StockOutsModule {}
