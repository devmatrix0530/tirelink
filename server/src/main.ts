import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import { authRouter } from './modules/auth/auth.router'
import { shopsRouter } from './modules/shops/shops.router'
import { servicesRouter } from './modules/services/services.router'
import { bookingsRouter } from './modules/bookings/bookings.router'
import { sellersRouter } from './modules/sellers/sellers.router'
import { phoneRouter } from './modules/phone/phone.router'
import { paymentsRouter } from './modules/payments/payments.router'
import { notificationsRouter } from './modules/notifications/notifications.router'
import { reviewsRouter } from './modules/reviews/reviews.router'
import { analyticsRouter } from './modules/analytics/analytics.router'
import { errorHandler } from './common/error-handler'

export const prisma = new PrismaClient()

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://devmatrix0530.github.io',
  ].filter(Boolean),
  credentials: true,
}))
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRouter)
app.use('/api/phone', phoneRouter)
app.use('/api/shops', shopsRouter)
app.use('/api/services', servicesRouter)
app.use('/api/bookings', bookingsRouter)
app.use('/api/sellers', sellersRouter)
app.use('/api/payments', paymentsRouter)
app.use('/api/notifications', notificationsRouter)
app.use('/api/reviews', reviewsRouter)
app.use('/api/analytics', analyticsRouter)

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
