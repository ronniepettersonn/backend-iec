import { Router } from 'express'
import {
  createPost,
  getPostBySlug,
  listPosts
} from '../controllers/post.controller'

import { createPostTag, listPostTags } from '../controllers/postTag.controller'
import { createPostComment, listPostComments } from '../controllers/postComment.controller'
import { isAuthenticated } from '../middlewares/isAuthenticated'

const router = Router()

router.post('/', isAuthenticated,createPost)
router.get('/', listPosts)
router.get('/:slug', getPostBySlug)

router.post('/tags',isAuthenticated, createPostTag)
router.get('/tags', listPostTags)

router.post('/:postId/comments', createPostComment)
router.get('/:postId/comments', listPostComments)

export default router
