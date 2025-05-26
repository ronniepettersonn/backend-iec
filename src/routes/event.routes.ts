import { Router } from 'express'
import { createEvent, deleteEvent, getAllEvents, getEventById, updateEvent } from '../controllers/event.controller'
import { isAuthenticated } from '../middlewares/isAuthenticated'
import { hasRole } from '../middlewares/hasRole'
import { Role } from '../@types/roles'

const router = Router()

router.use(isAuthenticated)


router.post('/',hasRole(Role.ADMIN, Role.LEADER, Role.PASTOR), createEvent)
router.get('/', getAllEvents)
router.get('/:id', getEventById)
router.put('/:id', hasRole(Role.ADMIN, Role.LEADER, Role.PASTOR),updateEvent)
router.delete('/:id', hasRole(Role.ADMIN, Role.LEADER, Role.PASTOR),deleteEvent)

export default router