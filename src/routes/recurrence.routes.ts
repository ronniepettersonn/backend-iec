import { Router } from 'express'
import {
  createRecurrence,
  listRecurrences,
  updateRecurrence,
  deleteRecurrence
} from '../controllers/recurrence.controller'
import { isAuthenticated } from '../middlewares/isAuthenticated'
import { checkModuleAccess } from '../middlewares/checkModuleAccess'
import { hasRole } from '../middlewares/hasRole'

const router = Router()

router.use(isAuthenticated)
router.use(hasRole('ADMIN', 'FINANCE'))
router.use(checkModuleAccess('finance'))

router.post('/', createRecurrence)
router.get('/', listRecurrences)
router.put('/:id', updateRecurrence)
router.delete('/:id', deleteRecurrence)

export default router
