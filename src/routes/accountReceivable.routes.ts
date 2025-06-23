import { Router } from 'express'
import {
  createAccountReceivable,
  deleteAccountReceivable,
  listAccountsReceivable,
  markAsReceived
} from '../controllers/accountReceivable.controller'
import { isAuthenticated } from '../middlewares/isAuthenticated'
import { hasRole } from '../middlewares/hasRole'
import { checkModuleAccess } from '../middlewares/checkModuleAccess'

const router = Router()

router.use(isAuthenticated)
router.use(hasRole('ADMIN', 'FINANCE'))
router.use(checkModuleAccess('finance'))

router.post('/', createAccountReceivable)
router.get('/', listAccountsReceivable)
router.patch('/:id/receive', markAsReceived)
router.delete('/:id', deleteAccountReceivable)

export default router