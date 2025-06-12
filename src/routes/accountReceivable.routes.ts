import { Router } from 'express'
import {
  createAccountReceivable,
  deleteAccountReceivable,
  listAccountsReceivable,
  markAsReceived
} from '../controllers/accountReceivable.controller'
import { isAuthenticated } from '../middlewares/isAuthenticated'

const router = Router()

router.use(isAuthenticated)

router.post('/', createAccountReceivable)
router.get('/', listAccountsReceivable)
router.patch('/:id/receive', markAsReceived)
router.delete('/:id', deleteAccountReceivable)

export default router