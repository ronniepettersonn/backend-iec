import { Router } from 'express';
import {
  listActiveModules,
  activateModule,
  deactivateModule,
} from '../controllers/activeModule.controller';

const router = Router();

// Listar módulos ativos de uma igreja
router.get('/:churchId', listActiveModules);

// Ativar módulo para uma igreja
router.post('/:churchId', activateModule);

// Desativar módulo de uma igreja
router.delete('/:churchId/:moduleId', deactivateModule);

export default router;
