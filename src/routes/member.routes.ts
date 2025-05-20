import { Router } from 'express'
import { createMember, deleteMember, getMemberById, getMembers, updateMember } from '../controllers/member.controller'
import { isAuthenticated } from '../middlewares/isAuthenticated'

const router = Router()

router.use(isAuthenticated)

router.post('/',createMember)
router.get('/',getMembers)
router.get('/:id',getMemberById)
router.put('/:id',updateMember)
router.delete('/:id',deleteMember)

export default router