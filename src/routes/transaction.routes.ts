import { Router } from 'express'
import { createTransaction, listTransactions } from '../controllers/transaction.controller'
import { isAuthenticated } from '../middlewares/isAuthenticated'
import { checkModuleAccess } from '../middlewares/checkModuleAccess'
import { hasRole } from '../middlewares/hasRole'

const router = Router()


router.use(isAuthenticated)
router.use(hasRole('ADMIN', 'FINANCE'))
router.use(checkModuleAccess('finance'))

router.post('/', createTransaction)
router.get('/', listTransactions)

export default router