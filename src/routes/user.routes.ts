import { Router } from 'express'
import { isAuthenticated } from '../middlewares/isAuthenticated'
import { deleteUser, listUsers, updateUser } from '../controllers/user.controller'

const router = Router()

router.use(isAuthenticated)

router.get('/', listUsers)
router.put('/:id', updateUser)
router.delete('/:id', deleteUser)

export default router