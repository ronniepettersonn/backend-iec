import { Router } from 'express'
import {
    createNotice,
    getAllNotices,
    updateNotice,
    deleteNotice,
} from '../controllers/notice.controller'
import { isAuthenticated } from '../middlewares/isAuthenticated'

const router = Router()

router.use(isAuthenticated)

router.post('/', createNotice)
router.get('/', getAllNotices)
router.put('/:id', updateNotice)
router.delete('/:id', deleteNotice)

export { router as noticeRoutes }