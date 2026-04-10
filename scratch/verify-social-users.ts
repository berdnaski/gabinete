import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.user.updateMany({
    where: {
      accounts: {
        some: {}
      },
      isVerified: false
    },
    data: {
      isVerified: true
    }
  });

  console.log(`Updated ${result.count} social users to be verified.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
