import { Router } from 'express'
import { addMemberToMinistry, createMinistry, deleteMinistry, getMinistryById, removeMemberFromMinistry, updateMinistry } from '../controllers/ministry.controller'
import { getAllMinistries } from '../controllers/ministry.controller'
import { isAuthenticated } from '../middlewares/isAuthenticated'
import { hasRole } from '../middlewares/hasRole'
import { Role } from '../@types/roles'

const router = Router()

router.use(isAuthenticated)

router.use(hasRole(Role.ADMIN))

router.post('/', createMinistry)
router.get('/', getAllMinistries)
router.post('/add-member', addMemberToMinistry)
router.post('/remove-member', removeMemberFromMinistry)
router.get('/:id', getMinistryById)
router.put('/:id', updateMinistry)
router.delete('/:id', deleteMinistry)

export default router