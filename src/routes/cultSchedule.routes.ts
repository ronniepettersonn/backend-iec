import { Router } from 'express'
import { isAuthenticated } from '../middlewares/isAuthenticated'
import { createCultSchedule, deleteCultSchedule, listCultSchedules, updateCultSchedule } from '../controllers/cultSchedule.controller'


const router = Router()

// Proteger todas as rotas com autenticação
router.use(isAuthenticated)

// Criar nova escala de culto
router.post('/', createCultSchedule)

// Listar escalas de culto com paginação
router.get('/', listCultSchedules)

// Atualizar escala de culto
router.put('/:id', updateCultSchedule)

// Deletar escala de culto
router.delete('/:id', deleteCultSchedule)

export default router