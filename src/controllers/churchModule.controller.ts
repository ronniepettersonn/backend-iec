import { Request, Response } from 'express';
import { prisma } from '../prisma/client';

// Listar todos os módulos disponíveis
export const listModules = async (_req: Request, res: Response) => {
  try {
    const modules = await prisma.churchModule.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(modules);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar módulos', details: error });
  }
};

// Criar um novo módulo (admin)
export const createModule = async (req: Request, res: Response) => {
  try {
    const { name, key, description } = req.body;

    const existing = await prisma.churchModule.findUnique({ where: { key } });
    if (existing) {
      return res.status(400).json({ error: 'Chave do módulo já cadastrada.' });
    }

    const module = await prisma.churchModule.create({
      data: { name, key, description },
    });

    res.status(201).json(module);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar módulo', details: error });
  }
};

// Editar módulo
export const updateModule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, key, description } = req.body;

    const updated = await prisma.churchModule.update({
      where: { id },
      data: { name, key, description },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar módulo', details: error });
  }
};

// Deletar módulo
export const deleteModule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.churchModule.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar módulo', details: error });
  }
};
