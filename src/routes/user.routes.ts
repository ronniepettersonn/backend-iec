import { Router } from 'express'
import { isAuthenticated } from '../middlewares/isAuthenticated'
import { deleteUser, listUsers, updateUser, updateUserRole } from '../controllers/user.controller'
import { hasRole } from '../middlewares/hasRole'
import { Role } from '../@types/roles'

const router = Router()

router.use(isAuthenticated)

router.get('/', listUsers)
router.put('/:id', hasRole( Role.ADMIN, Role.PASTOR),updateUser)
router.delete('/:id', hasRole( Role.ADMIN, Role.PASTOR),deleteUser)
router.patch('/:id/role', hasRole( Role.ADMIN, Role.PASTOR),updateUserRole)

export default router