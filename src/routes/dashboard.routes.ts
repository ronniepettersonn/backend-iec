import { Router } from 'express'
import { getFinancialChartData, getFinancialDashboard } from '../controllers/dashboard.controller'
import { isAuthenticated } from '../middlewares/isAuthenticated'
import { hasRole } from '../middlewares/hasRole'

const router = Router()

router.get('/dashboard', isAuthenticated, hasRole('ADMIN'), getFinancialDashboard)
router.get('/chart-data', isAuthenticated, getFinancialChartData)

export default router