import { Router } from 'express'
import { deleteMessage, getInboxMessages, getMessageById, getSentMessages, markMessageAsRead, sendMessage } from '../controllers/message.controller'
import { isAuthenticated } from '../middlewares/isAuthenticated'
import { hasRole } from '../middlewares/hasRole'

const router = Router()

router.use(isAuthenticated)

router.post('/', sendMessage)
router.get('/inbox', getInboxMessages)
router.get('/sent', getSentMessages)
router.get('/:id', getMessageById)
router.delete('/:id', deleteMessage)
router.patch('/:id/read', markMessageAsRead)


export default router