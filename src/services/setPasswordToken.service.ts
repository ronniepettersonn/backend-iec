import jwt from 'jsonwebtoken';
import { addHours, isBefore, differenceInHours } from 'date-fns';
import { randomUUID } from 'crypto';
import { prisma } from '../prisma/client';

const JWT_SECRET = process.env.JWT_SECRET!;
const TOKEN_TTL_HOURS = 1;       // expiração do link
export const REQUEST_WINDOW_HOURS = 24; // janela total do fluxo

export async function createSetPasswordToken(userId: string) {
  const jti = randomUUID();
  const expiresAt = addHours(new Date(), TOKEN_TTL_HOURS);

  await prisma.passwordToken.create({
    data: { userId, type: 'SET_PASSWORD', jti, expiresAt },
  });

  const jwtToken = jwt.sign(
    { sub: userId, jti, typ: 'set_password' },
    JWT_SECRET,
    { expiresIn: `${TOKEN_TTL_HOURS}h` }
  );

  return jwtToken;
}

export async function validateSetPasswordToken(token: string) {
    try {
        //console.log(token,JWT_SECRET, 'VENDO O JWT_SECRET')
        const payload = jwt.verify(token, JWT_SECRET) as { sub: string; jti: string; typ: string };
        if (payload.typ !== 'set_password') throw new Error('invalid typ');
        
        const row = await prisma.passwordToken.findUnique({ where: { jti: payload.jti } });
        if (!row || row.usedAt) throw new Error('used/not found');
        if (isBefore(row.expiresAt, new Date())) throw new Error('expired');
        
        return { ok: true, userId: payload.sub, jti: payload.jti };
    } catch(error) {
      console.log('NO VALIDATESETPASSWORDTOKEN ', error)
    return { ok: false };
  }
}

export async function consumeSetPasswordToken(jti?: string) {
    if(!jti) return

    console.log('RODOU O UPDATED DE TOKEN USADO')
  await prisma.passwordToken.update({
    where: { jti },
    data: { usedAt: new Date() },
  });
}

/** Checa se a última solicitação está dentro da janela de 24h */
export async function inRequestWindow(userId: string) {
  const last = await prisma.passwordToken.findFirst({
    where: { userId, type: 'SET_PASSWORD' },
    orderBy: { createdAt: 'desc' },
  });
  if (!last) return true;
  return differenceInHours(new Date(), last.createdAt) <= REQUEST_WINDOW_HOURS;
}
