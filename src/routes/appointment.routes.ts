import { Router } from 'express'
import { createAppointment, listAppointments } from '../controllers/appointment.controller'
import { isAuthenticated } from '../middlewares/isAuthenticated'

const router = Router()

router.use(isAuthenticated)

router.post('/', createAppointment)
router.get('/', listAppointments)

export { router as appointmentRoutes }