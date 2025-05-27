import { Router } from 'express'
import { isAuthenticated } from '../middlewares/isAuthenticated'
import { deleteUser, listUsers, updateProfilePicture, updateUser, updateUserRole } from '../controllers/user.controller'
import { hasRole } from '../middlewares/hasRole'
import { Role } from '../@types/roles'
import { upload } from '../middlewares/multer'

const router = Router()

router.use(isAuthenticated)

router.get('/', listUsers)
router.post('/profile/avatar', upload.single('file'), updateProfilePicture);
router.put('/:id', hasRole( Role.ADMIN, Role.PASTOR),updateUser)
router.delete('/:id', hasRole( Role.ADMIN, Role.PASTOR),deleteUser)
router.patch('/:id/role', hasRole( Role.ADMIN, Role.PASTOR),updateUserRole)

export default router