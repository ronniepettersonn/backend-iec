import { Router } from 'express'
import { createTransaction, listTransactions } from '../controllers/transaction.controller'
import { isAuthenticated } from '../middlewares/isAuthenticated'

const router = Router()

router.use(isAuthenticated)

router.post('/', createTransaction)
router.get('/', listTransactions)

export default router