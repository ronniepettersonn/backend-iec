import { Router } from 'express'
import { changePassword, definirSenha, login, loginWithGoogle, requestPasswordReset, resetPassword } from '../controllers/auth.controller'
import { isAuthenticated } from '../middlewares/isAuthenticated'
import { createUserByAdmin } from '../controllers/user.controller'

const router = Router()

router.post('/login', login)
router.post('/login/google', loginWithGoogle)
//router.post('/register', register)

router.post('/create-user',isAuthenticated , createUserByAdmin)

router.post('/forgot-password', requestPasswordReset)
router.post('/reset-password', resetPassword)
router.post('/change-password', isAuthenticated, changePassword)

router.post('/definir-senha', definirSenha);

export default router