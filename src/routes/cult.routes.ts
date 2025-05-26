import { Router } from 'express'
import { createCult, createCultType, deleteCult, getCultById, listCults, listCultTypes, updateCult, updateCultType } from '../controllers/cult.controller'
import { isAuthenticated } from '../middlewares/isAuthenticated'
import { hasRole } from '../middlewares/hasRole'
import { Role } from '../@types/roles'

const router = Router()
router.use(isAuthenticated)


router.post('/', hasRole(Role.ADMIN, Role.PASTOR),createCult)
router.get('/', listCults)
router.post('/types', hasRole(Role.ADMIN, Role.PASTOR),createCultType)
router.get('/types', hasRole(Role.ADMIN, Role.PASTOR),listCultTypes)
router.delete('/:id', deleteCult)
router.get('/:id', getCultById)
router.put('/:id', updateCult)
router.put('/types/:id', hasRole(Role.ADMIN, Role.PASTOR),updateCultType)

export default router