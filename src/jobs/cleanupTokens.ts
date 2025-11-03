import cron from 'node-cron';
import { prisma } from '../prisma/client'

// Evita múltiplas execuções em ambientes com mais réplicas.
// Usa advisory lock do Postgres como "mutex" distribuído.
async function withPgMutex<T>(key: number, fn: () => Promise<T>) {
  // tenta pegar lock
  const got = await prisma.$queryRawUnsafe<boolean>('SELECT pg_try_advisory_lock($1)', key);
  if (!got) return; // outra instância já está rodando
  try {
    return await fn();
  } finally {
    await prisma.$queryRawUnsafe('SELECT pg_advisory_unlock($1)', key);
  }
}

async function cleanup() {
  const res = await prisma.passwordToken.deleteMany({
    where: {
      OR: [
        { usedAt: { not: null } },
        { expiresAt: { lt: new Date(Date.now() - 7*24*60*60*1000) } },
      ],
    },
  });
  console.log(`[cleanupTokens] removidos: ${res.count}`);
}

export function startCleanupTokensCron() {
  // Executa diariamente às 03:00 America/Sao_Paulo
  cron.schedule('0 3 * * *', async () => {
    await withPgMutex(987654321, cleanup);
  }, { timezone: 'America/Sao_Paulo' });

  // (Opcional) Executa uma vez logo na subida para limpar resíduos antigos
  // com pequeno atraso para garantir conexão ok.
  setTimeout(() => {
    withPgMutex(987654321, cleanup).catch((e) =>
      console.error('[cleanupTokens] erro na execução inicial:', e)
    );
  }, 10_000);
}
