// src/jobs/recurrenceStatus.job.ts
import cron from 'node-cron'
import { updateRecurrenceStatuses } from '../services/recurrenceStatus.service'


// Executa todos os dias a cada hora
export const startRecurrenceStatusJob = () => {
  cron.schedule('0 * * * *', async () => {
    console.log('[RecurrenceStatusJob] Iniciando verificação de status...')
    await updateRecurrenceStatuses()
  })
}