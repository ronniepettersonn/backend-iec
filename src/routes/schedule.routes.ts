import { Router } from 'express'
import { createSchedule, listSchedules, updateSchedule } from '../controllers/schedule.controller'
import { isAuthenticated } from '../middlewares/isAuthenticated'

const router = Router()

router.use(isAuthenticated)

router.post('/', createSchedule)
router.get('/', listSchedules)
router.put('/:id', updateSchedule)

export default router