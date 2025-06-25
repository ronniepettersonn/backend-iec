import { Router } from 'express'
import {
  createPostCategory,
  updatePostCategory,
  deletePostCategory,
  listPostCategories,
  getPostCategoryById
} from '../controllers/postCategory.controller'
import { isAuthenticated } from '../middlewares/isAuthenticated'

const router = Router()

router.post('/', isAuthenticated, createPostCategory)
router.get('/', listPostCategories)
router.get('/:id', getPostCategoryById)
router.put('/:id', updatePostCategory)
router.delete('/:id', deletePostCategory)

export default router
