import { Router } from 'express'
import {
  createVisitor,
  getVisitors,
  getVisitorById,
  updateVisitor,
  deleteVisitor,
  getUncontactedVisitors,
  markContacted,
} from '../controllers/visitor.controller'

import { isAuthenticated } from '../middlewares/isAuthenticated'

const router = Router()

router.use(isAuthenticated)

router.post('/', createVisitor)
router.get('/', getVisitors)
router.get('/uncontacted', getUncontactedVisitors)
router.patch('/contacted/:id', markContacted)
router.get('/:id', getVisitorById)
router.put('/:id', updateVisitor)
router.delete('/:id', deleteVisitor)

export default router