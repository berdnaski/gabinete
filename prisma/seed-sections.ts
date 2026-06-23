import { config } from 'dotenv';
config();
import { PrismaClient, CabinetSectionType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding default cabinet sections...');

  const cabinets = await prisma.cabinet.findMany({
    include: {
      sections: true,
    },
  });

  let createdCount = 0;

  for (const cabinet of cabinets) {
    if (cabinet.sections.length === 0) {
      // Add default sections
      await prisma.cabinetSection.createMany({
        data: [
          {
            cabinetId: cabinet.id,
            type: CabinetSectionType.HERO,
            title: cabinet.heroTitle || cabinet.name,
            subtitle: cabinet.heroSubtitle || cabinet.tagline || 'Bem-vindo ao nosso gabinete digital',
            sortOrder: 0,
            enabled: true,
          },
          {
            cabinetId: cabinet.id,
            type: CabinetSectionType.BIOGRAPHY,
            title: 'Sobre o Gabinete',
            subtitle: 'Conheça nossa história e atuação',
            sortOrder: 1,
            enabled: true,
          },
          {
            cabinetId: cabinet.id,
            type: CabinetSectionType.STATS,
            title: 'Transparência em Números',
            sortOrder: 2,
            enabled: true,
          },
          {
            cabinetId: cabinet.id,
            type: CabinetSectionType.RESULTS,
            title: 'Resultados e Conquistas',
            sortOrder: 3,
            enabled: true,
          },
          {
            cabinetId: cabinet.id,
            type: CabinetSectionType.DEMANDS_CTA,
            title: 'Sua voz importa',
            subtitle: 'Tem uma demanda para o seu bairro? Envie para nós!',
            sortOrder: 4,
            enabled: true,
          },
          {
            cabinetId: cabinet.id,
            type: CabinetSectionType.CONTACT,
            title: 'Fale Conosco',
            sortOrder: 5,
            enabled: true,
          },
        ],
      });
      createdCount++;
    }
  }

  console.log(`Added default sections to ${createdCount} cabinets.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
