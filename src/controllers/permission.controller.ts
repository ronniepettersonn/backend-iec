import { Request, Response } from 'express'
import { prisma } from '../prisma/client'

export const createPermission = async (req: Request, res: Response) => {
  const { name } = req.body
  const churchId = req.churchId

  if (!churchId) {
    return res.status(400).json({ error: 'Igreja não identificada' })
  }

  try {
    const permission = await prisma.permission.create({
      data: {
        name,
        churchId
      }
    })

    res.status(201).json(permission)
  } catch (error) {
    console.error(error)
    res.status(400).json({ error: 'Erro ao criar permissão' })
  }
}


export const listPermissions = async (_: Request, res: Response) => {
  const permissions = await prisma.permission.findMany()
  res.json(permissions)
}

export const assignPermissionToRole = async (req: Request, res: Response) => {
  const { permissionId, role } = req.body
  const churchId = req.churchId

  if (!churchId) {
    return res.status(400).json({ error: 'Igreja não identificada' })
  }

  try {
    const exists = await prisma.rolePermission.findFirst({
      where: { permissionId, role, churchId }
    })

    if (exists) {
      return res.status(409).json({ error: 'Permissão já atribuída a esse papel nesta igreja' })
    }

    const rolePermission = await prisma.rolePermission.create({
      data: {
        permissionId,
        role,
        churchId
      }
    })

    res.status(201).json(rolePermission)
  } catch (error) {
    console.error(error)
    res.status(400).json({ error: 'Erro ao atribuir permissão' })
  }
}
