import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const supplier1 = await prisma.user.upsert({
    where: { email: 'supplier1@tradegrid.com' },
    update: {},
    create: {
      name: 'Lagos Manufacturing Co.',
      email: 'supplier1@tradegrid.com',
      password: await bcrypt.hash('password123', 10),
      role: 'SUPPLIER',
      verified: true,
    },
  });

  const supplier2 = await prisma.user.upsert({
    where: { email: 'supplier2@tradegrid.com' },
    update: {},
    create: {
      name: 'Accra Textiles Ltd',
      email: 'supplier2@tradegrid.com',
      password: await bcrypt.hash('password123', 10),
      role: 'SUPPLIER',
      verified: true,
    },
  });

  const supplier3 = await prisma.user.upsert({
    where: { email: 'supplier3@tradegrid.com' },
    update: {},
    create: {
      name: 'Nairobi Agro Products',
      email: 'supplier3@tradegrid.com',
      password: await bcrypt.hash('password123', 10),
      role: 'SUPPLIER',
      verified: false,
    },
  });

  await prisma.user.upsert({
    where: { email: 'buyer1@tradegrid.com' },
    update: {},
    create: {
      name: 'East Africa Distributors',
      email: 'buyer1@tradegrid.com',
      password: await bcrypt.hash('password123', 10),
      role: 'BUYER',
      verified: false,
    },
  });

  const products = [
    {
      name: 'Industrial Steel Pipes',
      description: 'High-quality galvanized steel pipes for construction',
      price: 45000,
      minOrderQty: 50,
      location: 'Lagos, Nigeria',
      category: 'Construction Materials',
      supplierId: supplier1.id,
    },
    {
      name: 'Woven Kente Fabric',
      description: 'Premium hand-woven kente cloth, various patterns',
      price: 12000,
      minOrderQty: 20,
      location: 'Accra, Ghana',
      category: 'Textiles',
      supplierId: supplier2.id,
    },
    {
      name: 'Organic Coffee Beans',
      description: 'Single-origin Ethiopian coffee beans, fair trade certified',
      price: 8500,
      minOrderQty: 100,
      location: 'Nairobi, Kenya',
      category: 'Agricultural Products',
      supplierId: supplier3.id,
    },
    {
      name: 'Solar Panel 250W',
      description: 'Monocrystalline solar panels for off-grid systems',
      price: 65000,
      minOrderQty: 10,
      location: 'Lagos, Nigeria',
      category: 'Electronics',
      supplierId: supplier1.id,
    },
    {
      name: 'Shea Butter (Raw)',
      description: 'Unrefined shea butter for cosmetics and food industry',
      price: 3500,
      minOrderQty: 200,
      location: 'Accra, Ghana',
      category: 'Agricultural Products',
      supplierId: supplier2.id,
    },
    {
      name: 'Cassava Flour',
      description: 'Processed cassava flour, food-grade quality',
      price: 1200,
      minOrderQty: 500,
      location: 'Nairobi, Kenya',
      category: 'Food & Beverages',
      supplierId: supplier3.id,
    },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log('Database seeded successfully!');
  console.log('Demo accounts:');
  console.log('  Supplier: supplier1@tradegrid.com / password123');
  console.log('  Buyer: buyer1@tradegrid.com / password123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
