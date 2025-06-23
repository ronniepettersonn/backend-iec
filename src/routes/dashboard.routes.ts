import { Router } from 'express'
import { getDashboardOverview, getFinancialAlerts, getFinancialChartData, getFinancialDashboard, getFinancialSummaryByPeriod } from '../controllers/dashboard.controller'
import { isAuthenticated } from '../middlewares/isAuthenticated'
import { hasRole } from '../middlewares/hasRole'
import { checkModuleAccess } from '../middlewares/checkModuleAccess'

const router = Router()

router.use(isAuthenticated)
router.use(checkModuleAccess('finance'))
router.use(hasRole('ADMIN'))

router.get('/dashboard', getFinancialDashboard)
router.get('/chart-data', getFinancialChartData)
router.get('/alerts', getFinancialAlerts)
router.get('/financial-summary', getFinancialSummaryByPeriod)
router.get('/dashboard-overview', getDashboardOverview)

export default router