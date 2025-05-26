import { Router } from 'express'
import { getNotificationCount, listNotifications, markAllAsRead, markNotificationRead } from '../controllers/notification.controller'
import { isAuthenticated } from '../middlewares/isAuthenticated'

const router = Router()

router.use(isAuthenticated)

router.get('/', listNotifications)
router.get('/count', getNotificationCount)
router.post('/read', markNotificationRead)
router.post('/mark-all-read', markAllAsRead)

export default router