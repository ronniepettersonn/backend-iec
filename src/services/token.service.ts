import { randomBytes } from 'crypto'
import { addHours } from 'date-fns'
import { prisma } from '../prisma/client'

export const createPasswordResetToken = async (userId: string) => {
  const token = randomBytes(32).toString('hex')
  const expiresAt = addHours(new Date(), 1) // válido por 1 hora

  await prisma.passwordResetToken.create({
    data: {
      userId,
      token,
      expiresAt
    }
  })

  return token
}