import { Router } from 'express'
import {
  createPostCategory,
  updatePostCategory,
  deletePostCategory,
  listPostCategories,
  getPostCategoryById
} from '../controllers/postCategory.controller'

const router = Router()

router.post('/', createPostCategory)
router.get('/', listPostCategories)
router.get('/:id', getPostCategoryById)
router.put('/:id', updatePostCategory)
router.delete('/:id', deletePostCategory)

export default router
