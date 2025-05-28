import { Router } from 'express'
import { isAuthenticated } from '../middlewares/isAuthenticated'
import { exportTransactionsCsv, exportTransactionsPdf } from '../controllers/report.controller'

const router = Router()

router.get('/transactions-csv', isAuthenticated, exportTransactionsCsv)
router.get('/transactions-pdf', isAuthenticated, exportTransactionsPdf)

export default router