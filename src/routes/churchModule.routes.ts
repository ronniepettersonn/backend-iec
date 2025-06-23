import { Router } from 'express';
import {
  listModules,
  createModule,
  updateModule,
  deleteModule,
} from '../controllers/churchModule.controller';

const router = Router();

router.get('/', listModules);
router.post('/', createModule);
router.put('/:id', updateModule);
router.delete('/:id', deleteModule);

export default router;
