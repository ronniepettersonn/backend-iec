import { Router } from 'express'
import { isAuthenticated } from '../middlewares/isAuthenticated'
import { deleteAccountPayable, listAccountsPayable, updateAccountPayable, markAccountAsPaid, createAccountPayable, uploadAccountPayableAttachment } from '../controllers/accountPayable.controller'
import { upload } from '../middlewares/multer'

const router = Router()

router.get('/', isAuthenticated, listAccountsPayable)
router.post('/', isAuthenticated, createAccountPayable)
router.put('/:id', isAuthenticated, updateAccountPayable)
router.delete('/:id', isAuthenticated, deleteAccountPayable)
router.patch('/:id/pay', isAuthenticated, markAccountAsPaid)
router.post('/:accountPayableId/attachment', upload.single('file'), uploadAccountPayableAttachment)


export default router