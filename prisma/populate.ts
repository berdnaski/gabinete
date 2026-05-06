import { PrismaClient, DemandStatus, DemandPriority, UserRole, CabinetRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const citizenNames = [
  'João Silva', 'Maria Oliveira', 'Pedro Santos', 'Ana Souza', 'Carlos Ferreira',
  'Paula Costa', 'Marcos Gomes', 'Julia Lima', 'Lucas Pereira', 'Fernanda Alves',
  'Gabriel Ribeiro', 'Larissa Carvalho', 'Rodrigo Martins', 'Camila Rodrigues', 'Bruno Soares',
  'Amanda Vieira', 'Felipe Rocha', 'Vanessa Castro', 'Thiago Barbosa', 'Renata Nogueira',
  'Rafael Machado', 'Aline Ramos', 'Diego Cardoso', 'Tatiana Teixeira', 'Ricardo Silva',
  'Beatriz Freitas', 'Leonardo Moraes', 'Carolina Santos', 'Daniel Almeida', 'Priscila Souza'
];

const neighborhoods = [
  { name: 'Centro', lat: -18.9186, lng: -48.2772 },
  { name: 'Santa Mônica', lat: -18.9150, lng: -48.2450 },
  { name: 'Umuarama', lat: -18.8850, lng: -48.2620 },
  { name: 'Martins', lat: -18.9120, lng: -48.2850 },
  { name: 'Brasil', lat: -18.9050, lng: -48.2720 },
  { name: 'Roosevelt', lat: -18.8900, lng: -48.2900 },
  { name: 'Planalto', lat: -18.9400, lng: -48.3150 },
  { name: 'Luizote de Freitas', lat: -18.9250, lng: -48.3350 },
  { name: 'Morumbi', lat: -18.9100, lng: -48.2150 },
  { name: 'Tibery', lat: -18.9020, lng: -48.2500 },
  { name: 'Saraiva', lat: -18.9280, lng: -48.2650 },
  { name: 'Aparecida', lat: -18.9110, lng: -48.2630 },
  { name: 'Granada', lat: -18.9500, lng: -48.2550 },
  { name: 'Segismundo Pereira', lat: -18.9230, lng: -48.2380 },
  { name: 'Patrimônio', lat: -18.9390, lng: -48.2820 }
];

const streets = [
  'Avenida Rondon Pacheco', 'Avenida João Naves de Ávila', 'Avenida Segismundo Pereira', 
  'Avenida Belarmino Cotta Pacheco', 'Rua Olegário Maciel', 'Rua Santos Dumont', 
  'Avenida Afonso Pena', 'Avenida Floriano Peixoto', 'Rua Duque de Caxias', 
  'Avenida Getúlio Vargas', 'Avenida Vasconcelos Costa', 'Rua Niterói', 
  'Rua Carmo Giffoni', 'Rua Vitalino Cândido de Oliveira', 'Avenida Anselmo Alves dos Santos'
];

const demandTemplates: Record<string, { title: string, description: string }[]> = {
  'Infraestrutura Viária': [
    { title: 'Buraco perigoso na Av. Rondon Pacheco', description: 'Há uma cratera na pista da direita logo após o viaduto. Vários carros já tiveram pneus rasgados.' },
    { title: 'Asfalto cedendo na Rua Olegário Maciel', description: 'O asfalto está afundando próximo ao bueiro, criando um desnível perigoso.' },
    { title: 'Boca de lobo sem tampa na Rua Santos Dumont', description: 'A tampa de concreto quebrou e agora há um vão enorme na calçada.' },
    { title: 'Rua sem pavimentação no bairro Morumbi', description: 'Muita poeira em dias secos e lama intransitável quando chove.' }
  ],
  'Iluminação Pública': [
    { title: 'Poste sem luz na Av. João Naves de Ávila', description: 'A lâmpada queimou há mais de um mês e a escuridão atrai assaltos.' },
    { title: 'Lâmpada piscando na Rua Duque de Caxias', description: 'A lâmpada fica piscando a noite toda, atrapalhando o sono dos moradores.' },
    { title: 'Falta de postes na Rua Carmo Giffoni', description: 'Trecho de 100 metros completamente às escuras.' }
  ],
  'Saneamento Básico': [
    { title: 'Vazamento de esgoto na Av. Segismundo Pereira', description: 'Esgoto jorrando na sarjeta com cheiro insuportável.' },
    { title: 'Vazamento de água limpa na calçada', description: 'Água potável sendo desperdiçada há dias na altura do número 500.' },
    { title: 'Falta de pressão na rede de água', description: 'A água não sobe para a caixa d\'água dos moradores da parte alta.' }
  ],
  'Saúde': [
    { title: 'Falta de médicos pediatras na UAI Tibery', description: 'Mães aguardando com crianças há mais de 5 horas por atendimento.' },
    { title: 'Aparelho de Raio-X quebrado na UAI', description: 'O único aparelho da unidade está quebrado, forçando transferência de pacientes.' },
    { title: 'Falta de medicamentos básicos na farmácia', description: 'Não estão fornecendo remédios para hipertensão e diabetes.' }
  ],
  'Segurança Pública': [
    { title: 'Onda de assaltos no bairro Santa Mônica', description: 'Criminosos agindo frequentemente no horário de saída dos estudantes.' },
    { title: 'Ponto de drogas em praça pública', description: 'Famílias não conseguem mais frequentar a praça por falta de segurança.' }
  ],
  'Meio Ambiente': [
    { title: 'Poda de árvore urgente na Rua Niterói', description: 'Os galhos estão pesados e encostando na fiação elétrica de alta tensão.' },
    { title: 'Descarte irregular de entulho no bairro Granada', description: 'Terreno baldio sendo usado como depósito de lixo e móveis velhos.' },
    { title: 'Poluição sonora de estabelecimento comercial', description: 'Som extremamente alto após o horário permitido.' }
  ],
  'Transporte Público': [
    { title: 'Ônibus da linha T131 sempre superlotado', description: 'Passageiros viajando em condições degradantes nos horários de pico.' },
    { title: 'Atrasos constantes na linha A145', description: 'O ônibus raramente cumpre os horários da tabela oficial.' },
    { title: 'Abrigo de ônibus quebrado na Av. Getúlio Vargas', description: 'Estrutura enferrujada e sem cobertura para chuva e sol.' }
  ]
};

const genericTemplates = [
  { title: 'Melhorias necessárias na infraestrutura local', description: 'Moradores solicitam atenção do poder público para melhorias gerais na segurança e pavimentação.' },
  { title: 'Manutenção urgente na via pública', description: 'A via necessita de reparos imediatos para garantir a segurança de quem transita por aqui diariamente.' },
  { title: 'Solicitação de atendimento para a comunidade', description: 'Buscamos apoio do gabinete para solucionar problemas recorrentes enfrentados pelos cidadãos locais.' }
];

const imagePool = [
  'https://images.unsplash.com/photo-1515162305285-0293e4767cc2', 
  'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7', 
  'https://images.unsplash.com/photo-1618477388954-7852f32655ec', 
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d', 
  'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957', 
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72', 
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158', 
  'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7', 
  'https://images.unsplash.com/photo-1518173946687-a4c8a3b7722e', 
  'https://images.unsplash.com/photo-1579208575657-c595a05383b7'
];

const commentTemplates = [
  'Espero que resolvam logo esse problema!',
  'Passo por aí todo dia e está cada vez pior.',
  'Um absurdo a falta de atenção com nosso bairro.',
  'Obrigado por registrar essa demanda.',
  'Precisamos de uma solução definitiva, não apenas remendos.',
  'A comunidade agradece o apoio.',
  'Situação crítica! Risco de acidentes graves.',
  'Crianças e idosos estão sofrendo com isso.'
];

const cabinetCommentTemplates = [
  'Já encaminhamos o ofício para a Secretaria competente.',
  'Nossa equipe esteve no local e está cobrando providências.',
  'Demanda registrada. Acompanharemos o andamento junto aos órgãos responsáveis.',
  'Estamos aguardando o retorno do setor técnico.',
  'Problema solucionado! Agradecemos o contato e a confiança.'
];

async function main() {
  console.log('🚀 Iniciando script de população do sistema...');

  const hashedPassword = await bcrypt.hash('123456', 10);
  const timestamp = Date.now();

  // 1. Buscar Categorias existentes
  let categories = await prisma.category.findMany();
  if (categories.length === 0) {
    console.log('⚠️ Nenhuma categoria encontrada. Criando categorias padrão...');
    const defaultCategories = [
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
    for (const cat of defaultCategories) {
      await prisma.category.create({
        data: { 
          name: cat.name, 
          slug: cat.name.toLowerCase().replace(/\s+/g, '-') 
        },
      });
    }
    categories = await prisma.category.findMany();
  }
  console.log(`✅ ${categories.length} categorias prontas.`);

  // 2. Criar Gabinetes e Membros se necessário
  let members = await prisma.cabinetMember.findMany({ include: { user: true } });
  if (members.length < 5) {
    console.log('👥 Poucos membros de gabinete encontrados. Criando novos gabinetes e membros...');
    const cabinetData = [
      { name: 'Gabinete Solidário', slug: `gabinete-solidario-${timestamp}` },
      { name: 'Gabinete Mobilidade e Infra', slug: `gabinete-mobilidade-${timestamp}` },
      { name: 'Gabinete Saúde e Bem-Estar', slug: `gabinete-saude-${timestamp}` }
    ];

    for (let i = 0; i < cabinetData.length; i++) {
      const cab = await prisma.cabinet.create({
        data: {
          name: cabinetData[i].name,
          slug: cabinetData[i].slug,
          description: `Gabinete focado em atender as demandas da população de Uberlândia sobre ${cabinetData[i].name}.`,
          avatarUrl: `https://images.unsplash.com/photo-1557683316-973673baf926?w=150`
        }
      });

      // Criar Owner
      const ownerUser = await prisma.user.create({
        data: {
          name: `Vereador(a) Titular ${i + 1}`,
          email: `vereador${i + 1}_${timestamp}@gabinete.com`,
          password: hashedPassword,
          role: UserRole.MEMBER,
          hasSetPassword: true,
          isVerified: true,
          termsAcceptedAt: new Date(),
          avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`
        }
      });

      await prisma.cabinetMember.create({
        data: {
          userId: ownerUser.id,
          cabinetId: cab.id,
          role: CabinetRole.OWNER
        }
      });

      // Criar Staff
      for (let j = 1; j <= 2; j++) {
        const staffUser = await prisma.user.create({
          data: {
            name: `Assessor(a) ${j} do Gabinete ${i + 1}`,
            email: `assessor${i + 1}_${j}_${timestamp}@gabinete.com`,
            password: hashedPassword,
            role: UserRole.MEMBER,
            hasSetPassword: true,
            isVerified: true,
            termsAcceptedAt: new Date(),
            avatarUrl: `https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150`
          }
        });

        await prisma.cabinetMember.create({
          data: {
            userId: staffUser.id,
            cabinetId: cab.id,
            role: CabinetRole.STAFF
          }
        });
      }
    }
    members = await prisma.cabinetMember.findMany({ include: { user: true } });
  }
  console.log(`✅ ${members.length} membros de gabinete disponíveis.`);

  // 3. Criar Cidadãos (Repórteres) se necessário
  let citizens = await prisma.user.findMany({ where: { role: UserRole.CITIZEN } });
  if (citizens.length < 20) {
    console.log('🙋‍♂️ Poucos cidadãos encontrados. Criando novos cidadãos...');
    for (let i = 0; i < citizenNames.length; i++) {
      await prisma.user.create({
        data: {
          name: citizenNames[i],
          email: `cidadao_${i}_${timestamp}@exemplo.com`,
          password: hashedPassword,
          role: UserRole.CITIZEN,
          hasSetPassword: true,
          isVerified: true,
          termsAcceptedAt: new Date(),
          phone: `(34) 99999-${1000 + i}`,
          avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + (i * 1000000)}?w=150`
        }
      });
    }
    citizens = await prisma.user.findMany({ where: { role: UserRole.CITIZEN } });
  }
  console.log(`✅ ${citizens.length} cidadãos disponíveis.`);

  // 4. Criar Demandas (~80)
  console.log('📝 Criando 80 demandas em Uberlândia...');
  const createdDemands: any[] = [];
  const demandPriorities = [
    DemandPriority.LOW, DemandPriority.MEDIUM, 
    DemandPriority.HIGH, DemandPriority.URGENT
  ];

  for (let i = 0; i < 80; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const memberAssignee = members[Math.floor(Math.random() * members.length)];
    const cabinetId = memberAssignee.cabinetId; 
    const reporter = citizens[Math.floor(Math.random() * citizens.length)];

    // Determinar Status (distribuição realista)
    const rand = Math.random();
    let status: DemandStatus = DemandStatus.SUBMITTED;
    if (rand < 0.15) status = DemandStatus.SUBMITTED;
    else if (rand < 0.35) status = DemandStatus.IN_ANALYSIS;
    else if (rand < 0.70) status = DemandStatus.IN_PROGRESS;
    else if (rand < 0.90) status = DemandStatus.RESOLVED;
    else if (rand < 0.95) status = DemandStatus.REJECTED;
    else status = DemandStatus.CANCELED;

    const priority = demandPriorities[Math.floor(Math.random() * demandPriorities.length)];

    // Pegar template de título/descrição
    const templates = demandTemplates[category.name] || genericTemplates;
    const template = templates[Math.floor(Math.random() * templates.length)];

    // Localização em Uberlândia
    const neighborhood = neighborhoods[Math.floor(Math.random() * neighborhoods.length)];
    const street = streets[Math.floor(Math.random() * streets.length)];
    const num = Math.floor(Math.random() * 2000) + 10;
    
    const latOffset = (Math.random() - 0.5) * 0.01;
    const lngOffset = (Math.random() - 0.5) * 0.01;

    const finalTitle = template.title.replace('[Bairro]', neighborhood.name).replace('[Rua]', street);
    const finalDescription = template.description;

    const demand = await prisma.demand.create({
      data: {
        title: finalTitle,
        description: finalDescription,
        status: status,
        priority: priority,
        address: `${street}, ${num}`,
        neighborhood: neighborhood.name,
        city: 'Uberlândia',
        state: 'MG',
        lat: neighborhood.lat + latOffset,
        long: neighborhood.lng + lngOffset,
        zipcode: `3840${Math.floor(Math.random()*9)}-${Math.floor(Math.random()*900)+100}`,
        reporterId: reporter.id,
        cabinetId: cabinetId,
        categoryId: category.id,
        assigneeMemberId: status !== DemandStatus.SUBMITTED ? memberAssignee.id : null,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        termsAcceptedAt: new Date()
      }
    });

    createdDemands.push(demand);

    // Adicionar Evidência (Imagem)
    const imgUrl = imagePool[Math.floor(Math.random() * imagePool.length)];
    await prisma.demandEvidence.create({
      data: {
        id: uuidv4(),
        storageKey: `demands/${demand.id}/evidencia.jpg`,
        url: `${imgUrl}?w=800&auto=format&fit=crop`,
        mimeType: 'image/jpeg',
        size: 102400 + Math.floor(Math.random() * 500000),
        demandId: demand.id
      }
    });
  }
  console.log(`✅ 80 demandas criadas com evidências.`);

  // 5. Adicionar Likes e Comentários
  console.log('💬 Adicionando interações (likes e comentários)...');
  for (const demand of createdDemands) {
    const numLikes = Math.floor(Math.random() * 13) + 3;
    const shuffledCitizens = [...citizens].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < Math.min(numLikes, shuffledCitizens.length); i++) {
      try {
        await prisma.demandLike.create({
          data: {
            userId: shuffledCitizens[i].id,
            demandId: demand.id
          }
        });
      } catch (e) {
        // Ignorar duplicados
      }
    }

    const numComments = Math.floor(Math.random() * 4) + 1;
    for (let i = 0; i < numComments; i++) {
      const isCabinetResp = Math.random() > 0.6;
      
      let authorId = '';
      let content = '';

      if (isCabinetResp) {
        const cabMembers = members.filter(m => m.cabinetId === demand.cabinetId);
        const member = cabMembers.length > 0 
          ? cabMembers[Math.floor(Math.random() * cabMembers.length)] 
          : members[Math.floor(Math.random() * members.length)];
        authorId = member.userId;
        content = cabinetCommentTemplates[Math.floor(Math.random() * cabinetCommentTemplates.length)];
      } else {
        authorId = citizens[Math.floor(Math.random() * citizens.length)].id;
        content = commentTemplates[Math.floor(Math.random() * commentTemplates.length)];
      }

      await prisma.demandComment.create({
        data: {
          content: content,
          isCabinetResponse: isCabinetResp,
          demandId: demand.id,
          authorId: authorId,
          createdAt: new Date(demand.createdAt.getTime() + Math.floor(Math.random() * 48 * 60 * 60 * 1000))
        }
      });
    }
  }

  console.log('🎉 Ambiente de testes populado com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao popular banco:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
