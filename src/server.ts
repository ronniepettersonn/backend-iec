import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import memberRoutes from './routes/member.routes'
import authRoutes from './routes/auth.routes'
import userRoutes from './routes/user.routes'
import transactionRoutes from './routes/transaction.routes'
import dashboardRoutes from './routes/dashboard.routes'
import scheduleRoutes from './routes/schedule.routes'
import ministryRoutes from './routes/ministry.routes'
import eventRoutes from './routes/event.routes'
import visitorRoutes from './routes/visitor.routes'
import messageRoutes from './routes/message.routes'
import { noticeRoutes } from './routes/notice.routes'
import notificationRoutes from './routes/notification.routes'
import { appointmentRoutes } from './routes/appointment.routes'
import permissionRoutes from './routes/permission.routes'
import emailRoutes from './routes/email.routes'
import cultRoutes from './routes/cult.routes'
import cultScheduleRoutes from './routes/cultSchedule.routes'
import uploadRoutes from './routes/upload.routes'
import categoryRoutes from './routes/category.routes'
import recurrenceRoutes from './routes/recurrence.routes'
import reportRoutes from './routes/report.routes'
import cashRoutes from './routes/cash.routes'
import accountPayable from './routes/accountPayable.routes'
import accountReceivable from './routes/accountReceivable.routes'
import { swaggerSpec } from './config/swaggerConfig'
import swaggerUi from 'swagger-ui-express'
import { startRecurrenceStatusJob } from './jobs/recurrenceStatus.job'
import memberRoleRoutes from './routes/memberRole.routes'
import postRoutes from './routes/post.routes'
import postCategoryRoutes from './routes/postCategory.routes'
import churchModuleRoutes from './routes/churchModule.routes'
import churchRoutes from './routes/church.routes'
import activeModuleRoutes from './routes/activeModule.routes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3333

app.use(cors())
app.use(express.json())

app.use('/auth', authRoutes)
app.use('/members', memberRoutes)
app.use('/member-roles', memberRoleRoutes)
app.use('/users', userRoutes)
app.use('/transactions', transactionRoutes)
app.use('/finance', dashboardRoutes)
app.use('/schedules', scheduleRoutes)
app.use('/ministries', ministryRoutes)
app.use('/events', eventRoutes)
app.use('/visitors', visitorRoutes)
app.use('/messages', messageRoutes)
app.use('/notices', noticeRoutes)
app.use('/notifications', notificationRoutes)
app.use('/appointments', appointmentRoutes)
app.use('/admin/permissions', permissionRoutes)
app.use('/emails', emailRoutes)
app.use('/cults', cultRoutes)
app.use('/cult-schedules', cultScheduleRoutes)
app.use('/categories', categoryRoutes)
app.use('/recurrences', recurrenceRoutes)
app.use('/reports', reportRoutes)
app.use('/cash', cashRoutes)
app.use('/accounts-payable', accountPayable)
app.use('/accounts-receivable', accountReceivable)
app.use('/posts', postRoutes)
app.use('/post-categories', postCategoryRoutes)
app.use('/modules', churchModuleRoutes);
app.use('/churches', churchRoutes);
app.use('/churches/modules', activeModuleRoutes);

app.use('/upload', uploadRoutes)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

startRecurrenceStatusJob()

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
})