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
import { hasRole } from '../middlewares/hasRole'
import { Role } from '../@types/roles'

const router = Router()

router.use(isAuthenticated)

router.post('/', hasRole(Role.ADMIN, Role.LEADER, Role.PASTOR,),createVisitor)
router.get('/', getVisitors)
router.get('/uncontacted',  getUncontactedVisitors)
router.patch('/contacted/:id',  markContacted)
router.get('/:id', getVisitorById)
router.put('/:id',hasRole(Role.ADMIN, Role.LEADER, Role.PASTOR,), updateVisitor)
router.delete('/:id',hasRole(Role.ADMIN, Role.LEADER, Role.PASTOR,), deleteVisitor)

export default router