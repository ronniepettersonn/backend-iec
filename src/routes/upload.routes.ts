import { Router } from 'express';
import { uploadFile } from '../controllers/upload.controller'
import { upload } from '../middlewares/multer';
import { isAuthenticated } from '../middlewares/isAuthenticated'

const router = Router();

router.post('/', isAuthenticated, upload.single('file'), uploadFile);

export default router;