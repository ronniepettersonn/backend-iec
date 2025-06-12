import { Router } from 'express'
import { isAuthenticated } from '../middlewares/isAuthenticated'
import { deleteAccountPayable, listAccountsPayable, updateAccountPayable, markAccountAsPaid, createAccountPayable } from '../controllers/accountPayable.controller'

const router = Router()

router.get('/', isAuthenticated, listAccountsPayable)
router.post('/', isAuthenticated, createAccountPayable)
router.put('/:id', isAuthenticated, updateAccountPayable)
router.delete('/:id', isAuthenticated, deleteAccountPayable)
router.patch('/:id/pay', isAuthenticated, markAccountAsPaid)


export default router