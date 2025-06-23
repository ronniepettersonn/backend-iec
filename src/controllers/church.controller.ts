import { Request, Response } from 'express';
import { prisma } from '../prisma/client';

// Criar nova igreja
export const createChurch = async (req: Request, res: Response) => {
  try {
    const {
      name,
      fullName,
      slug,
      logoUrl,
      cnpj,
      email,
      phone,
      website,
      instagram,
      facebook,
      youtube,
      address,
      number,
      neighborhood,
      city,
      state,
      zipCode,
      foundingDate,
      notes,
      themeColor,
      customDomain,
      defaultLanguage,
      status,    // opcional
      active     // opcional
    } = req.body;

    const existing = await prisma.church.findUnique({ where: { slug } });
    if (existing) {
      return res.status(400).json({ error: 'Slug já está em uso.' });
    }

    const church = await prisma.church.create({
      data: {
        name,
        fullName,
        slug,
        logoUrl,
        cnpj,
        email,
        phone,
        website,
        instagram,
        facebook,
        youtube,
        address,
        number,
        neighborhood,
        city,
        state,
        zipCode,
        foundingDate: foundingDate ? new Date(foundingDate) : undefined,
        notes,
        themeColor,
        customDomain,
        defaultLanguage,
        status: status || 'ACTIVE',
        active: active ?? true
      }
    });

    res.status(201).json(church);
  } catch (error) {
    console.error('[createChurch]', error);
    res.status(500).json({ error: 'Erro ao criar igreja', details: error });
  }
};


// Listar todas as igrejas
export const listChurches = async (_req: Request, res: Response) => {
  try {
    const churches = await prisma.church.findMany({
      where: {
        status: 'ACTIVE', // ou status: { not: 'INACTIVE' } se quiser incluir 'SUSPENDED'
        active: true
      },
      include: { activeModules: true, users: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(churches);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar igrejas', details: error });
  }
};


// Obter uma igreja por ID
export const getChurchById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const church = await prisma.church.findUnique({
      where: { id },
      include: { activeModules: true, users: true },
    });

    if (!church) {
      return res.status(404).json({ error: 'Igreja não encontrada' });
    }

    res.json(church);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar igreja', details: error });
  }
};

// Atualizar igreja
export const updateChurch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      fullName,
      slug,
      logoUrl,
      cnpj,
      email,
      phone,
      website,
      instagram,
      facebook,
      youtube,
      address,
      number,
      neighborhood,
      city,
      state,
      zipCode,
      foundingDate,
      notes,
      themeColor,
      customDomain,
      defaultLanguage,
      status,
      active
    } = req.body;

    const updated = await prisma.church.update({
      where: { id },
      data: {
        name,
        fullName,
        slug,
        logoUrl,
        cnpj,
        email,
        phone,
        website,
        instagram,
        facebook,
        youtube,
        address,
        number,
        neighborhood,
        city,
        state,
        zipCode,
        foundingDate: foundingDate ? new Date(foundingDate) : undefined,
        notes,
        themeColor,
        customDomain,
        defaultLanguage,
        status,
        active
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('[updateChurch]', error);
    res.status(500).json({ error: 'Erro ao atualizar igreja', details: error });
  }
};


// Deletar igreja
export const deleteChurch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.church.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar igreja', details: error });
  }
};
