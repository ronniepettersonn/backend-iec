import { Router } from 'express'
import {
  createCategory,
  listCategories,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller'
import { isAuthenticated } from '../middlewares/isAuthenticated'

const router = Router()

router.post('/', isAuthenticated, createCategory)
router.get('/', isAuthenticated, listCategories)
router.put('/:id', isAuthenticated, updateCategory)
router.delete('/:id', isAuthenticated, deleteCategory)

export default router