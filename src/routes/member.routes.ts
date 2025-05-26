import { Router } from 'express'
import { createMember, deleteMember, getMemberById, getMembers, updateMember } from '../controllers/member.controller'
import { isAuthenticated } from '../middlewares/isAuthenticated'
import { hasRole } from '../middlewares/hasRole'
import { Role } from '../@types/roles'

const router = Router()

router.use(isAuthenticated)
router.use(hasRole(Role.ADMIN, Role.LEADER, Role.PASTOR))

router.post('/',createMember)
router.get('/',getMembers)
router.get('/:id',getMemberById)
router.put('/:id',updateMember)
router.delete('/:id',deleteMember)

export default router