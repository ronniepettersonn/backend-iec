import { Router } from 'express'
import { isAuthenticated } from '../middlewares/isAuthenticated'
import { createBankAccount, deleteBankAccount, getBankStatement, listBankAccounts, updateBankAccount } from '../controllers/bankAccount.controller'

const router = Router()

router.post('/', isAuthenticated, createBankAccount)
router.get('/', isAuthenticated, listBankAccounts)


router.put('/:id', isAuthenticated, updateBankAccount)
router.delete('/:id', isAuthenticated, deleteBankAccount)

router.get('/:id/statement', isAuthenticated, getBankStatement)


export default router