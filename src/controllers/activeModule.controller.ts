import { Request, Response } from 'express';
import { prisma } from '../prisma/client';

// Listar módulos ativos de uma igreja
export const listActiveModules = async (req: Request, res: Response) => {
  try {
    const { churchId } = req.params;

    const activeModules = await prisma.activeModule.findMany({
      where: { churchId },
      include: {
        module: true,
      },
    });

    res.json(activeModules);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar módulos ativos', details: error });
  }
};

// Ativar módulo para uma igreja
export const activateModule = async (req: Request, res: Response) => {
  try {
    const { churchId } = req.params;
    const { moduleId } = req.body;

    const existing = await prisma.activeModule.findUnique({
      where: {
        churchId_moduleId: {
          churchId,
          moduleId,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'Módulo já está ativo para essa igreja.' });
    }

    const activated = await prisma.activeModule.create({
      data: {
        churchId,
        moduleId,
      },
    });

    res.status(201).json(activated);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao ativar módulo', details: error });
  }
};

// Desativar módulo de uma igreja
export const deactivateModule = async (req: Request, res: Response) => {
  try {
    const { churchId, moduleId } = req.params;

    await prisma.activeModule.delete({
      where: {
        churchId_moduleId: {
          churchId,
          moduleId,
        },
      },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao desativar módulo', details: error });
  }
};
