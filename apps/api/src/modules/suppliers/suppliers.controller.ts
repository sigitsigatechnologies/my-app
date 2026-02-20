import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';

@ApiTags('suppliers')
@Controller('suppliers')
@ApiBearerAuth()
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search: string = '',
  ) {
    return this.suppliersService.findAll(+page, +limit, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(+id);
  }

  @Post()
  create(@Body() data: { name: string; phone?: string; address?: string }) {
    return this.suppliersService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: { name?: string; phone?: string; address?: string }) {
    return this.suppliersService.update(+id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.suppliersService.delete(+id);
  }
}
