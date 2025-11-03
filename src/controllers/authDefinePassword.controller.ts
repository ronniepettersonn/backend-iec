// src/controllers/authDefinePassword.controller.ts
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma/client';
import {
  createSetPasswordToken,
  validateSetPasswordToken,
  consumeSetPasswordToken,
  inRequestWindow,
} from '../services/setPasswordToken.service';
import { sendTemplatedEmail } from '../services/sendTemplateEmail.service';
// ⬇️ use seu serviço genérico de template


const GENERIC_MSG = 'Se existir uma conta para este e-mail, enviaremos um novo link.';

export async function validateDefinePassword(req: Request, res: Response) {
  const { token } = req.query as { token: string };
  const result = await validateSetPasswordToken(token);
  if (!result.ok) return res.status(400).json({ valid: false, reason: 'expired_or_invalid' });
  return res.json({ valid: true });
}

export async function resendDefinePassword(req: Request, res: Response) {
  const { email } = req.body as { email: string };
  const generic = () => res.json({ message: GENERIC_MSG });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return generic();

  // Dentro da janela (ex.: 24h)?
  if (!(await inRequestWindow(user.id))) return generic();

  // Novo token rotacionado
  const token = await createSetPasswordToken(user.id);
  const appUrl = process.env.APP_URL || 'https://app.verboigarape.com.br';
  const url = `${appUrl}/complete-password/${encodeURIComponent(token)}`;

  const displayName = (user.name?.trim() || email.split('@')[0]);

  // ⬇️ usa o seu serviço + mesmas variáveis do createUserByAdmin
  await sendTemplatedEmail({
    to: email,
    subject: 'Defina sua senha no Lightra',
    templateName: 'define-password',
    variables: {
      logoUrl:
        'https://www.verboigarape.com.br/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.481d02bd.png&w=750&q=75',
      title: 'Defina sua senha',
      message: `Olá ${displayName}, você solicitou um novo link para definir sua senha no Lightra. Clique no botão abaixo:`,
      buttonUrl: url,
      buttonText: 'Definir minha senha',
    },
  });

  return generic();
}

export async function completeDefinePassword(req: Request, res: Response) {
  const { token, password } = req.body as { token: string; password: string };

  const v = await validateSetPasswordToken(token);
  if (!v.ok) return res.status(400).json({ error: 'Token inválido/expirado' });

  const hash = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: v.userId },
    data: { passwordHash: hash },
  });

  await consumeSetPasswordToken(v.jti);
  return res.json({ ok: true });
}

