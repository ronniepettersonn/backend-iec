import { Router } from 'express'
import { changePassword, completePasswordReset, definirSenha, login, loginWithGoogle, requestPasswordReset, resetPassword } from '../controllers/auth.controller'
import { isAuthenticated } from '../middlewares/isAuthenticated'
import { createUserByAdmin } from '../controllers/user.controller'
import rateLimit from 'express-rate-limit'
import { completeDefinePassword, resendDefinePassword, validateDefinePassword } from '../controllers/authDefinePassword.controller'

const router = Router()

const resendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 6,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', login)
router.post('/login/google', loginWithGoogle)
//router.post('/register', register)

router.post('/create-user',isAuthenticated , createUserByAdmin)

router.post('/forgot-password', requestPasswordReset)
router.post('/reset-password', resetPassword)
router.post('/change-password', isAuthenticated, changePassword)

router.post('/reset-password/complete', completePasswordReset)

router.post('/definir-senha', definirSenha);

router.get('/password/define/validate', validateDefinePassword);
router.post('/password/define/resend', resendLimiter, resendDefinePassword);
router.post('/password/define/complete', completeDefinePassword);

export default router