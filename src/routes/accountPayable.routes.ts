import { Router } from 'express'
import { isAuthenticated } from '../middlewares/isAuthenticated'
import { deleteAccountPayable, listAccountsPayable, updateAccountPayable, markAccountAsPaid, createAccountPayable, uploadAccountPayableAttachment, getAccountsPayableSummary, getUpcomingAccountsPayable, getAccountsPayableAlerts } from '../controllers/accountPayable.controller'
import { upload } from '../middlewares/multer'
import { checkModuleAccess } from '../middlewares/checkModuleAccess'
import { hasRole } from '../middlewares/hasRole'

const router = Router()

router.use(isAuthenticated)
router.use(hasRole('ADMIN', 'FINANCE'))
router.use(checkModuleAccess('finance'))

router.get('/', isAuthenticated, listAccountsPayable)
router.post('/', isAuthenticated, createAccountPayable)

/* Rotas para dashboard financeiro relacionado a contas a pagar */
router.get('/summary', getAccountsPayableSummary);
router.get('/upcoming', getUpcomingAccountsPayable);
router.get('/alerts', getAccountsPayableAlerts);

router.put('/:id', isAuthenticated, updateAccountPayable)
router.delete('/:id', isAuthenticated, deleteAccountPayable)
router.patch('/:id/pay', isAuthenticated, markAccountAsPaid)
router.post('/:accountPayableId/attachment', upload.single('file'), uploadAccountPayableAttachment)


export default router