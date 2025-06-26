import { Router } from 'express'
import {
  createPost,
  getPostBySlug,
  listPosts,
  listPublicHighlights,
  togglePostPublished
} from '../controllers/post.controller'

import { createPostTag, listPostTags } from '../controllers/postTag.controller'
import { createPostComment, listPostComments } from '../controllers/postComment.controller'
import { isAuthenticated } from '../middlewares/isAuthenticated'

const router = Router()

router.post('/', isAuthenticated,createPost)
router.get('/', listPosts)
router.get('/highlights', listPublicHighlights)

router.post('/tags',isAuthenticated, createPostTag)
router.get('/tags', listPostTags)


router.get('/:slug', getPostBySlug)
router.patch('/:id/toggle-published', isAuthenticated, togglePostPublished)
router.post('/:postId/comments', createPostComment)
router.get('/:postId/comments', listPostComments)

export default router
