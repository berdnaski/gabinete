import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const validAvatars = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'
];

async function main() {
  console.log('🔧 Corrigindo avatares de usuários...');

  // Pegar todos os usuários que são Cidadãos criados pelo script (email contém cidadao_)
  const users = await prisma.user.findMany({
    where: {
      email: {
        contains: 'cidadao_'
      }
    }
  });

  console.log(`Encontrados ${users.length} cidadãos para atualizar.`);

  for (let i = 0; i < users.length; i++) {
    const newAvatar = validAvatars[Math.floor(Math.random() * validAvatars.length)];
    await prisma.user.update({
      where: { id: users[i].id },
      data: {
        avatarUrl: newAvatar
      }
    });
  }

  console.log('✅ Todos os avatares foram corrigidos!');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao corrigir avatares:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
