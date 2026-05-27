import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create a Unit
  const unit = await prisma.crusherUnit.create({
    data: {
      name: 'Main Plant',
      location: 'Default Location',
    },
  });

  // 2. Create Owner User
  const owner = await prisma.user.upsert({
    where: { phone: '9999999999' },
    update: {},
    create: {
      name: 'Admin Owner',
      phone: '9999999999',
      password: hashedPassword,
      role: 'OWNER',
      unitId: unit.id,
    },
  });

  console.log('Seed completed successfully:', { unit, owner });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
