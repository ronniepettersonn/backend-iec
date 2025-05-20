import { Router } from 'express'
import { createTransaction } from '../controllers/transaction.controller'
import { isAuthenticated } from '../middlewares/isAuthenticated'

const router = Router()

router.use(isAuthenticated)

router.post('/', createTransaction)

export default router