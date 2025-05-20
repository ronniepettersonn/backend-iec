import { Router } from 'express'
import { getFinancialDashboard } from '../controllers/dashboard.controller'
import { isAuthenticated } from '../middlewares/isAuthenticated'

const router = Router()

router.get('/dashboard', isAuthenticated, getFinancialDashboard)

export default router