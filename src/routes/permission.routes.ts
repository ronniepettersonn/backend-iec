import { Router } from 'express'
import { isAuthenticated } from '../middlewares/isAuthenticated'
import { hasRole } from '../middlewares/hasRole'
import { Role } from '../@types/roles'
import { assignPermissionToRole, createPermission, listPermissions } from '../controllers/permission.controller'


const router = Router()

router.use(isAuthenticated, hasRole(Role.ADMIN))

router.post('/', createPermission)
router.get('/', listPermissions)
router.post('/assign', assignPermissionToRole)

export default router