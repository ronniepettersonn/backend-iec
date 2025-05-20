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

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3333

app.use(cors())
app.use(express.json())

app.use('/auth', authRoutes)
app.use('/members', memberRoutes)
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


app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
})