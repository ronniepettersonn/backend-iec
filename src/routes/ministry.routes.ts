import { Router } from 'express'
import { createMinistry, deleteMinistry, getMinistryById, updateMinistry } from '../controllers/ministry.controller'
import { getAllMinistries } from '../controllers/ministry.controller'
import { isAuthenticated } from '../middlewares/isAuthenticated'

const router = Router()

router.use(isAuthenticated)

router.post('/', createMinistry)
router.get('/', getAllMinistries)
router.get('/:id', getMinistryById)
router.put('/:id', updateMinistry)
router.delete('/:id', deleteMinistry)

export default router