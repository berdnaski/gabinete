import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const CATEGORIES = [
  { name: 'Infraestrutura Viária' },
  { name: 'Iluminação Pública' },
  { name: 'Saneamento Básico' },
  { name: 'Saúde' },
  { name: 'Educação' },
  { name: 'Segurança Pública' },
  { name: 'Meio Ambiente' },
  { name: 'Habitação' },
  { name: 'Transporte Público' },
  { name: 'Assistência Social' },
  { name: 'Esporte e Lazer' },
  { name: 'Cultura' },
  { name: 'Animal Urbano' },
  { name: 'Economia e Trabalho' },
  { name: 'Outros' },
];

async function main() {
  console.log('🌱 Iniciando seed...');

  let criadas = 0;
  let existentes = 0;

  for (const cat of CATEGORIES) {
    const exists = await prisma.category.findFirst({
      where: { name: cat.name },
    });

    if (!exists) {
      await prisma.category.create({
        data: { name: cat.name, slug: cat.name.toLowerCase().replace(/\s+/g, '-') || '' },
      });
      criadas++;
    } else {
      existentes++;
    }
  }

  console.log(`✅ Categorias criadas: ${criadas} | Já existiam: ${existentes}`);
  console.log('🎉 Seed concluído!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });