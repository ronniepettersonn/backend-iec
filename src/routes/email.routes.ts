import { Router } from 'express'
import { sendEmail, updateEmailGroup, listMails, getMailById, updateEmailLabel, toggleFlagged, toggleStarred, moveToTrash, updateLabels } from '../controllers/email.controller'
import { isAuthenticated } from '../middlewares/isAuthenticated'

const router = Router()

router.use(isAuthenticated)

router.get('/', listMails)
router.post('/send', sendEmail)
router.patch('/labels', updateLabels)
router.patch('/delete', moveToTrash)
router.get('/:id', getMailById)
router.patch('/:id/group', updateEmailGroup)
router.patch('/:emailId/label', updateEmailLabel)
router.patch('/:emailId/toggle-flag', toggleFlagged)
router.patch('/:emailId/toggle-starred', toggleStarred)

export default router