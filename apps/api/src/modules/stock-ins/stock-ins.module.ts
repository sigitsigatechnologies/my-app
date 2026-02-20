import { Module } from '@nestjs/common';
import { StockInsService } from './stock-ins.service';
import { StockInsController } from './stock-ins.controller';

@Module({
  controllers: [StockInsController],
  providers: [StockInsService],
  exports: [StockInsService],
})
export class StockInsModule {}
