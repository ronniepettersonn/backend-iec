import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';

// Permite uma ou várias keys de módulo
export const checkModuleAccess = (moduleKeys: string | string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { churchId: true },
      });

      if (!user?.churchId) {
        return res.status(403).json({ error: 'Usuário não está vinculado a nenhuma igreja' });
      }

      const keys = Array.isArray(moduleKeys) ? moduleKeys : [moduleKeys];

      const activeModules = await prisma.activeModule.findMany({
        where: {
          churchId: user.churchId,
          module: { key: { in: keys } },
        },
      });

      if (activeModules.length === 0) {
        return res.status(403).json({
          error: `Nenhum dos módulos [${keys.join(', ')}] está ativo para esta igreja`,
        });
      }

      next();
    } catch (err) {
      console.error('[checkModuleAccess]', err);
      return res.status(500).json({ error: 'Erro ao verificar acesso ao módulo' });
    }
  };
};
