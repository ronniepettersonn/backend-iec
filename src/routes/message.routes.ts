import { Router } from 'express'
import { sendMessage } from '../controllers/message.controller'
import { isAuthenticated } from '../middlewares/isAuthenticated'


const router = Router()

router.use(isAuthenticated)

router.post('/', sendMessage)

export default router