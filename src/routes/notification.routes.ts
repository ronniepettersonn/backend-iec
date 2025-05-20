import { Router } from 'express'
import { getNotifications, markAsRead } from '../controllers/notification.controller'
import { isAuthenticated } from '../middlewares/isAuthenticated'

const router = Router()

router.use(isAuthenticated)

router.get('/', getNotifications)
router.patch('/:id/read', markAsRead)

export default router