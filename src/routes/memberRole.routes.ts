import { Router } from 'express'
import { createMemberRole, assignRolesToMember, listMemberRoles } from '../controllers/member.controller'
import { isAuthenticated } from '../middlewares/isAuthenticated'
import { hasRole } from '../middlewares/hasRole'
import { Role } from '@prisma/client'

const router = Router()

router.use(isAuthenticated)
router.use(hasRole(Role.ADMIN, Role.LEADER, Role.PASTOR))

// Criar novo papel
router.post('/', createMemberRole)

// Atribuir papéis a um membro
router.post('/assign', assignRolesToMember)

// Listar papéis disponíveis
router.get('/', listMemberRoles)

export default router
