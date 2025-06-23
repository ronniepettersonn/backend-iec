import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const modules = [
    { name: 'Financeiro', key: 'finance', description: 'Gerenciamento de entradas, saídas e caixa diário.' },
    { name: 'Comunicação', key: 'communication', description: 'Mensagens internas, notificações e agendamento de reuniões.' },
    { name: 'Membros', key: 'members', description: 'Cadastro e gestão dos membros da igreja.' },
    { name: 'Visitantes', key: 'visitors', description: 'Controle de visitantes e integração com membros.' },
    { name: 'Agenda', key: 'calendar', description: 'Eventos e agendamentos' },
    { name: 'Cultos', key: 'cults', description: 'Gestão de cultos, escalas e relatórios espirituais.' },
    { name: 'Eventos', key: 'events', description: 'Organização e divulgação de eventos da igreja.' },
    { name: 'Blog', key: 'blog', description: 'Publicação de artigos e conteúdo no site público.' },
  ]

  for (const mod of modules) {
    await prisma.churchModule.upsert({
      where: { key: mod.key },
      update: {},
      create: mod
    })
  }

  console.log('📦 Módulos padrão inseridos com sucesso.')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())