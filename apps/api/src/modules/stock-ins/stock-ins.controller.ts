import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsInt, IsArray, IsOptional, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { StockInsService } from './stock-ins.service';

class StockInItemDto {
  @IsInt()
  itemId!: number;

  @IsInt()
  @Min(1)
  qty!: number;
}

class CreateStockInDto {
  @IsInt()
  supplierId!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockInItemDto)
  items!: StockInItemDto[];
}

class UpdateStockInDto {
  @IsInt()
  @IsOptional()
  supplierId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockInItemDto)
  @IsOptional()
  items?: StockInItemDto[];
}

@ApiTags('stock-ins')
@Controller('stock-ins')
@ApiBearerAuth()
export class StockInsController {
  constructor(private readonly stockInsService: StockInsService) {}

  @Get()
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.stockInsService.findAll(+page, +limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockInsService.findOne(+id);
  }

  @Post()
  create(@Body() data: CreateStockInDto) {
    return this.stockInsService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateStockInDto) {
    return this.stockInsService.update(+id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.stockInsService.delete(+id);
  }
}
