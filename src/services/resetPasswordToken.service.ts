import jwt from 'jsonwebtoken';
import { addHours, isBefore } from 'date-fns';
import { randomUUID } from 'crypto';
import { prisma } from '../prisma/client';
import { isLegacyHexToken } from '../utils/helpers';

function getResetSecret() {
  const s = process.env.RESET_PASSWORD_SECRET || process.env.JWT_SECRET;
  if (!s) throw new Error('RESET_PASSWORD_SECRET/JWT_SECRET não configurado');
  return s;
}

const RESET_TTL_HOURS = 1;

export async function createResetPasswordToken(userId: string) {
  const jti = randomUUID();
  const expiresAt = addHours(new Date(), RESET_TTL_HOURS);

  await prisma.passwordToken.create({
    data: { userId, type: 'RESET_PASSWORD', jti, expiresAt },
  });

  const token = jwt.sign(
    { sub: userId, jti, typ: 'reset_password' },
    getResetSecret(),
    { expiresIn: `${RESET_TTL_HOURS}h`, algorithm: 'HS256' }
  );

  return token;
}

export async function validateResetPasswordToken(token: string) {
  try {
    if (isLegacyHexToken(token)) {
      // fluxo legado
      const legacy = await prisma.passwordResetToken.findUnique({ where: { token } });
      if (!legacy || isBefore(legacy.expiresAt, new Date())) throw new Error('legacy expired/not found');

      return { ok: true, userId: legacy.userId, jti: `legacy:${legacy.token}` };
    }

    // fluxo novo (JWT)
    const payload = jwt.verify(token, getResetSecret(), { algorithms: ['HS256'] }) as any;
    if (payload.typ !== 'reset_password') throw new Error('invalid typ');

    const row = await prisma.passwordToken.findUnique({ where: { jti: payload.jti } });
    if (!row || row.usedAt) throw new Error('used/not found');
    if (isBefore(row.expiresAt, new Date())) throw new Error('expired');

    return { ok: true, userId: payload.sub, jti: payload.jti };
  } catch {
    return { ok: false };
  }
}

export async function consumeResetPasswordToken(jti: string) {
  if (jti.startsWith('legacy:')) {
    const token = jti.replace('legacy:', '');
    await prisma.passwordResetToken.delete({ where: { token } }).catch(() => {});
    return;
  }
  await prisma.passwordToken.update({ where: { jti }, data: { usedAt: new Date() } });
}

/* export async function consumeResetPasswordToken(jti: string) {
  await prisma.passwordToken.update({
    where: { jti },
    data: { usedAt: new Date() },
  });
} */
