import { Router } from 'express'
import { createMember, deleteMember, getMemberById, getMembers, updateMember } from '../controllers/member.controller'
import { isAuthenticated } from '../middlewares/isAuthenticated'
import { hasRole } from '../middlewares/hasRole'
import { Role } from '../@types/roles'

const router = Router()

router.use(isAuthenticated)
router.use(hasRole(Role.ADMIN, Role.LEADER, Role.PASTOR))

/**
 * @swagger
 * /members:
 *   get:
 *     summary: Lista todos os membros
 *     tags: [Membros]
 *     responses:
 *       200:
 *         description: Retorna lista de membros
 */

router.get('/',getMembers)

/**
 * @swagger
 * /members:
 *   post:
 *     summary: Cria um novo membro
 *     tags: [Membros]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: João Silva
 *               email:
 *                 type: string
 *                 example: joao@example.com
 *               phone:
 *                 type: string
 *                 example: '+5511999999999'
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 example: '1990-05-20'
 *               address:
 *                 type: string
 *                 example: 'Rua das Flores, 123'
 *             required:
 *               - name
 *               - email
 *     responses:
 *       201:
 *         description: Membro criado com sucesso
 */
router.post('/',createMember)

/**
 * @swagger
 * /members/{id}:
 *   put:
 *     summary: Atualiza um membro existente
 *     tags: [Membros]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do membro
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Membro atualizado com sucesso
 */

router.put('/:id',updateMember)

/**
 * @swagger
 * /members/{id}:
 *   delete:
 *     summary: Deleta um membro
 *     tags: [Membros]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do membro
 *     responses:
 *       204:
 *         description: Membro removido com sucesso
 */

router.delete('/:id',deleteMember)
router.get('/:id',getMemberById)

export default router