import { Router } from 'express'
import { isAuthenticated } from '../middlewares/isAuthenticated'
import { closeDailyCash, getCashStatus, getTodayCash } from '../controllers/cash.controller'

const router = Router()

router.get('/today', isAuthenticated, getTodayCash)
router.get('/status', isAuthenticated, getCashStatus)
router.post('/close', isAuthenticated, closeDailyCash)

export default router
