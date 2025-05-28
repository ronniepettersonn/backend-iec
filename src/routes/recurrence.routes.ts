import { Router } from 'express'
import {
  createRecurrence,
  listRecurrences,
  updateRecurrence,
  deleteRecurrence
} from '../controllers/recurrence.controller'
import { isAuthenticated } from '../middlewares/isAuthenticated'

const router = Router()

router.post('/', isAuthenticated, createRecurrence)
router.get('/', isAuthenticated, listRecurrences)
router.put('/:id', isAuthenticated, updateRecurrence)
router.delete('/:id', isAuthenticated, deleteRecurrence)

export default router
