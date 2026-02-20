import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsInt, IsArray, IsOptional, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { StockOutsService } from './stock-outs.service';

class StockOutItemDto {
  @IsInt()
  itemId!: number;

  @IsInt()
  @Min(1)
  qty!: number;
}

class CreateStockOutDto {
  @IsOptional()
  destination?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockOutItemDto)
  items!: StockOutItemDto[];
}

class UpdateStockOutDto {
  @IsOptional()
  destination?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockOutItemDto)
  @IsOptional()
  items?: StockOutItemDto[];
}

@ApiTags('stock-outs')
@Controller('stock-outs')
@ApiBearerAuth()
export class StockOutsController {
  constructor(private readonly stockOutsService: StockOutsService) {}

  @Get()
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.stockOutsService.findAll(+page, +limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockOutsService.findOne(+id);
  }

  @Post()
  create(@Body() data: CreateStockOutDto) {
    return this.stockOutsService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateStockOutDto) {
    return this.stockOutsService.update(+id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.stockOutsService.delete(+id);
  }
}
