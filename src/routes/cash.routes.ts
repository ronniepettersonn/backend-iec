import { Router } from 'express'
import { isAuthenticated } from '../middlewares/isAuthenticated'
import { closeDailyCash, getTodayCash } from '../controllers/cash.controller'

const router = Router()

router.get('/today', isAuthenticated, getTodayCash)
router.post('/close', isAuthenticated, closeDailyCash)

export default router
