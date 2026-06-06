import { PrismaClient, UserRole, PlanTier } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as bcryptjs from 'bcryptjs';

dotenv.config();

const isLocal = process.env.DATABASE_URL?.includes('localhost') || process.env.DATABASE_URL?.includes('127.0.0.1');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(!isLocal && { ssl: { rejectUnauthorized: false } }),
});
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

const USERS = [
  {
    name: 'Admin',
    email: 'admin@lithium.com',
    role: UserRole.ADMIN,
    isVerified: true,
    hasSetPassword: true,
    termsAcceptedAt: new Date(),
    password: 'password',
  },
];

async function main() {
  console.log('🌱 Iniciando seed...');

  let criadas = 0;
  let existentes = 0;

  for (const user of USERS) {
    const hashedPassword = await bcryptjs.hash(user.password, 10);
    await prisma.user.upsert({
      where: { email: user.email },
      create: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: user.role,
        isVerified: user.isVerified,
        hasSetPassword: user.hasSetPassword,
        termsAcceptedAt: user.termsAcceptedAt,
      },
      update: {
        name: user.name,
        password: hashedPassword,
        role: user.role,
        isVerified: user.isVerified,
        hasSetPassword: user.hasSetPassword,
        disabledAt: null,
        termsAcceptedAt: user.termsAcceptedAt,
      },
    });
  }

  console.log(`✅ Usuários criados / atualizados: ${USERS.map((u) => u.email).join(', ')}`);

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

  // ─── Features ────────────────────────────────────────────────────────────────
  const FEATURES = [
    { slug: 'heatmap',    name: 'Heatmap',         description: 'Mapa de calor geográfico de demandas' },
    { slug: 'csv_export', name: 'Exportação CSV',  description: 'Exportação de demandas em formato CSV' },
    { slug: 'widget',     name: 'Widget',           description: 'Botão embarcável para sites externos' },
  ]

  for (const feat of FEATURES) {
    await prisma.feature.upsert({
      where: { slug: feat.slug },
      create: feat,
      update: { name: feat.name, description: feat.description },
    })
  }
  console.log(`✅ Features: ${FEATURES.map((f) => f.slug).join(', ')}`)

  // ─── Plans ───────────────────────────────────────────────────────────────────
  const PLANS: Array<{
    tier: PlanTier
    name: string
    priceInCents: number
    maxMembers: number | null
    maxDemands: number | null
    maxStorageGb: number | null
    features: string[]
  }> = [
    {
      tier: PlanTier.ESSENCIAL,
      name: 'Mandato Essencial',
      priceInCents: 19700,
      maxMembers: 3,
      maxDemands: 200,
      maxStorageGb: 5,
      features: [],
    },
    {
      tier: PlanTier.PROFISSIONAL,
      name: 'Mandato Profissional',
      priceInCents: 49700,
      maxMembers: 8,
      maxDemands: 1000,
      maxStorageGb: 25,
      features: ['heatmap', 'csv_export'],
    },
    {
      tier: PlanTier.CAPITAL,
      name: 'Mandato Capital',
      priceInCents: 119700,
      maxMembers: null,
      maxDemands: null,
      maxStorageGb: 100,
      features: ['heatmap', 'csv_export', 'widget'],
    },
  ]

  for (const plan of PLANS) {
    const { features: planFeatures, ...planData } = plan
    const record = await prisma.plan.upsert({
      where: { tier: planData.tier },
      create: planData,
      update: {
        name: planData.name,
        priceInCents: planData.priceInCents,
        maxMembers: planData.maxMembers,
        maxDemands: planData.maxDemands,
        maxStorageGb: planData.maxStorageGb,
      },
    })

    for (const featureSlug of planFeatures) {
      await prisma.planFeature.upsert({
        where: { planId_featureSlug: { planId: record.id, featureSlug } },
        create: { planId: record.id, featureSlug, effectiveFrom: null },
        update: {},
      })
    }
  }
  console.log(`✅ Planos: ${PLANS.map((p) => p.name).join(', ')}`)

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
