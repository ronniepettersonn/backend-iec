import { Router } from 'express'
import { getFinancialAlerts, getFinancialChartData, getFinancialDashboard, getFinancialSummaryByPeriod } from '../controllers/dashboard.controller'
import { isAuthenticated } from '../middlewares/isAuthenticated'
import { hasRole } from '../middlewares/hasRole'

const router = Router()

router.get('/dashboard', isAuthenticated, hasRole('ADMIN'), getFinancialDashboard)
router.get('/chart-data', isAuthenticated, getFinancialChartData)
router.get('/alerts', isAuthenticated, getFinancialAlerts)
router.get('/financial-summary', isAuthenticated, getFinancialSummaryByPeriod)

export default router