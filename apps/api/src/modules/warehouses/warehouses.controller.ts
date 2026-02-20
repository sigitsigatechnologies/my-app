import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WarehousesService } from './warehouses.service';

@ApiTags('warehouses')
@Controller('warehouses')
@ApiBearerAuth()
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Get()
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search: string = '',
  ) {
    return this.warehousesService.findAll(+page, +limit, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.warehousesService.findOne(+id);
  }

  @Post()
  create(@Body() data: { name: string; location: string }) {
    return this.warehousesService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: { name?: string; location?: string }) {
    return this.warehousesService.update(+id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.warehousesService.delete(+id);
  }
}
