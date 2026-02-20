import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StocksService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.stock.findMany({
      include: { item: true, warehouse: true },
      orderBy: { item: { name: 'asc' } },
    });
  }
}
