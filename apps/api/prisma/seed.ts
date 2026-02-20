import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@wms.local' },
    update: {},
    create: { name: 'Admin', email: 'admin@wms.local', passwordHash, role: Role.ADMIN },
  });

  const cat = await prisma.category.create({ data: { name: 'Default' } });
  const item = await prisma.item.create({ data: { name: 'Sample Item', sku: 'SKU-001', categoryId: cat.id, minStock: 10 } });
  const wh = await prisma.warehouse.create({ data: { name: 'Main Warehouse', location: 'HQ' } });
  await prisma.stock.create({ data: { itemId: item.id, warehouseId: wh.id, quantity: 100 } });
  await prisma.supplier.create({ data: { name: 'Default Supplier', phone: '0800000000', address: 'City' } });
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
