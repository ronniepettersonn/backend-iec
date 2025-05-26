import { Router } from 'express'
import { changePassword, login, register, requestPasswordReset, resetPassword } from '../controllers/auth.controller'
import { isAuthenticated } from '../middlewares/isAuthenticated'

const router = Router()

router.post('/login', login)
router.post('/register', register)
router.post('/forgot-password', requestPasswordReset)
router.post('/reset-password', resetPassword)
router.post('/change-password', isAuthenticated, changePassword)

export default router