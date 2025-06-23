import { Router } from 'express';
import {
  createChurch,
  listChurches,
  getChurchById,
  updateChurch,
  deleteChurch,
} from '../controllers/church.controller';

const router = Router();

// Listar todas as igrejas
router.get('/', listChurches);

// Criar uma nova igreja
router.post('/', createChurch);

// Buscar igreja por ID
router.get('/:id', getChurchById);

// Atualizar uma igreja
router.put('/:id', updateChurch);

// Deletar uma igreja
router.delete('/:id', deleteChurch);

export default router;
