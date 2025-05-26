import { Router } from 'express'
import { createAppointment, getAllAppointments, getAppointmentById, getMyAppointments, listAppointments, rescheduleAppointment, softDeleteAppointment, updateAppointment } from '../controllers/appointment.controller'
import { isAuthenticated } from '../middlewares/isAuthenticated'
import { hasRole } from '../middlewares/hasRole'
import { Role } from '../@types/roles'

const router = Router()

router.use(isAuthenticated)
router.use(hasRole(Role.ADMIN, Role.LEADER, Role.PASTOR))

router.post('/', createAppointment)
router.get('/', listAppointments)
router.get('/', getAllAppointments)
router.get('/my', getMyAppointments)
router.get('/:id', getAppointmentById)
router.put('/:id', updateAppointment)
router.delete('/:id', softDeleteAppointment)
router.patch('/:id/reschedule', rescheduleAppointment)

export { router as appointmentRoutes }