import { Router } from 'express'
import { createEvent, deleteEvent, getAllEvents, getEventById, updateEvent } from '../controllers/event.controller'
import { isAuthenticated } from '../middlewares/isAuthenticated'

const router = Router()

router.use(isAuthenticated)

router.post('/', createEvent)
router.get('/', getAllEvents)
router.get('/:id', getEventById)
router.put('/:id', updateEvent)
router.delete('/:id', deleteEvent)

export default router