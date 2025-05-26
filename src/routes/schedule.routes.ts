import { Router } from 'express'
import { createSchedule, listSchedules, updateSchedule } from '../controllers/schedule.controller'
import { isAuthenticated } from '../middlewares/isAuthenticated'
import { hasRole } from '../middlewares/hasRole'
import { Role } from '../@types/roles'

const router = Router()

router.use(isAuthenticated)

router.use(hasRole(Role.ADMIN, Role.LEADER, Role.PASTOR))

router.post('/', createSchedule)
router.get('/', listSchedules)
router.put('/:id', updateSchedule)

export default router