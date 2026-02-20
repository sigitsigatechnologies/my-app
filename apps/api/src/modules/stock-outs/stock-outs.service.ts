import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StockOutsService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      this.prisma.stockOut.findMany({
        skip,
        take: limit,
        include: { items: { include: { item: true } } },
        orderBy: { date: 'desc' },
      }),
      this.prisma.stockOut.count(),
    ]);
    
    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const stockOut = await this.prisma.stockOut.findUnique({
      where: { id },
      include: { items: { include: { item: true } } },
    });
    if (!stockOut) throw new NotFoundException('StockOut not found');
    return stockOut;
  }

  async create(data: { destination?: string; items: { itemId: number; qty: number }[] }) {
    // Validate stock availability before creating (default warehouse)
    for (const item of data.items) {
      const existingStock = await this.prisma.stock.findFirst({
        where: { itemId: item.itemId, warehouseId: 1 },
      });
      
      if (!existingStock || existingStock.quantity < item.qty) {
        const available = existingStock?.quantity || 0;
        throw new Error(`Insufficient stock for item ${item.itemId}. Available: ${available}, Requested: ${item.qty}`);
      }
    }

    const stockOut = await this.prisma.stockOut.create({
      data: {
        destination: data.destination,
        items: {
          create: data.items,
        },
      },
      include: { items: { include: { item: true } } },
    });

    // Update stock quantities (default warehouse)
    for (const item of data.items) {
      await this.prisma.stock.updateMany({
        where: { itemId: item.itemId, warehouseId: 1 },
        data: { quantity: { decrement: item.qty } },
      });
    }

    return stockOut;
  }

  async update(id: number, data: { destination?: string; items?: { itemId: number; qty: number }[] }) {
    const existingStockOut = await this.findOne(id);
    
    // If items are being updated, revert old stock and add new
    if (data.items) {
      // Validate stock availability
      for (const item of data.items) {
        const existingStock = await this.prisma.stock.findFirst({
          where: { itemId: item.itemId, warehouseId: 1 },
        });
        
        if (!existingStock || existingStock.quantity < item.qty) {
          const available = existingStock?.quantity || 0;
          throw new Error(`Insufficient stock for item ${item.itemId}. Available: ${available}, Requested: ${item.qty}`);
        }
      }
      
      // Revert old stock quantities
      for (const item of existingStockOut.items) {
        const existingStock = await this.prisma.stock.findFirst({
          where: { itemId: item.itemId, warehouseId: 1 },
        });
        if (existingStock) {
          await this.prisma.stock.update({
            where: { id: existingStock.id },
            data: { quantity: { increment: item.qty } },
          });
        }
      }
      
      // Deduct new stock quantities
      for (const item of data.items) {
        await this.prisma.stock.updateMany({
          where: { itemId: item.itemId, warehouseId: 1 },
          data: { quantity: { decrement: item.qty } },
        });
      }
      
      // Delete old items
      await this.prisma.stockOutItem.deleteMany({
        where: { stockOutId: id },
      });
      
      // Create new items
      for (const item of data.items) {
        await this.prisma.stockOutItem.create({
          data: { stockOutId: id, itemId: item.itemId, qty: item.qty },
        });
      }
    }
    
    return this.prisma.stockOut.update({
      where: { id },
      data: { destination: data.destination ?? existingStockOut.destination },
      include: { items: { include: { item: true } } },
    });
  }

  async delete(id: number) {
    // First get the stockOut to know what items to revert
    const stockOut = await this.findOne(id);
    
    // Revert stock quantities (default warehouse)
    for (const item of stockOut.items) {
      const existingStock = await this.prisma.stock.findFirst({
        where: { itemId: item.itemId, warehouseId: 1 },
      });
      
      if (existingStock) {
        await this.prisma.stock.update({
          where: { id: existingStock.id },
          data: { quantity: { increment: item.qty } },
        });
      }
    }
    
    // Delete the stockOut items first
    await this.prisma.stockOutItem.deleteMany({
      where: { stockOutId: id },
    });
    
    // Now delete the stockOut
    await this.prisma.stockOut.delete({ where: { id } });
  }
}
