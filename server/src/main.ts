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

// Seed endpoint (development convenience)
app.all('/api/seed', async (_req, res) => {
  try {
    const { PrismaClient } = await import('@prisma/client')
    const seedPrisma = new PrismaClient()
    const existing = await seedPrisma.shop.count()
    if (existing > 0) {
      await seedPrisma.$disconnect()
      return res.json({ message: 'Already seeded', count: existing })
    }
    const s1 = await seedPrisma.shop.create({ data: { name: 'Speed Tire Center', address: '123 Gangnam-daero, Seoul', latitude: 37.5, longitude: 127.0, liftCount: 4, openingHours: '09:00 - 18:00', rating: 4.5, imageUrl: 'https://images.unsplash.com/photo-1580674285054-bed31eacf5f4?w=800', active: true } })
    const s2 = await seedPrisma.shop.create({ data: { name: 'Pro Auto Service', address: '456 Teheran-ro, Seoul', latitude: 37.51, longitude: 127.02, liftCount: 2, openingHours: '08:00 - 20:00', rating: 4.2, imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800', active: true } })
    const s3 = await seedPrisma.shop.create({ data: { name: 'Premium Tire & Wheel', address: '789 Yangjae-daero, Seoul', latitude: 37.48, longitude: 127.05, liftCount: 6, openingHours: '09:30 - 19:00', rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800', active: true } })
    const domesticInches = [13,14,15,16,17,18,19,20]
    const importInches = [15,16,17,18,19,20,21,22]
    const services: any[] = []
    for (const shop of [s1, s2, s3]) {
      for (const inch of domesticInches) services.push({ shopId: shop.id, category: 'domestic', inch, price: 20000 + inch * 1000 })
      for (const inch of importInches) services.push({ shopId: shop.id, category: 'import', inch, price: 30000 + inch * 1500 })
    }
    await seedPrisma.service.createMany({ data: services })
    await seedPrisma.$disconnect()
    res.json({ message: 'Seed completed', shops: 3, services: services.length })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

app.use(errorHandler)

async function autoSeed() {
  try {
    const count = await prisma.shop.count()
    if (count === 0) {
      console.log('No shops found — auto-seeding...')
      const s1 = await prisma.shop.create({ data: { name: 'Speed Tire Center', address: '123 Gangnam-daero, Seoul', latitude: 37.5, longitude: 127.0, liftCount: 4, openingHours: '09:00 - 18:00', rating: 4.5, imageUrl: 'https://images.unsplash.com/photo-1580674285054-bed31eacf5f4?w=800', active: true } })
      const s2 = await prisma.shop.create({ data: { name: 'Pro Auto Service', address: '456 Teheran-ro, Seoul', latitude: 37.51, longitude: 127.02, liftCount: 2, openingHours: '08:00 - 20:00', rating: 4.2, imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800', active: true } })
      const s3 = await prisma.shop.create({ data: { name: 'Premium Tire & Wheel', address: '789 Yangjae-daero, Seoul', latitude: 37.48, longitude: 127.05, liftCount: 6, openingHours: '09:30 - 19:00', rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800', active: true } })
      const domesticInches = [13,14,15,16,17,18,19,20]
      const importInches = [15,16,17,18,19,20,21,22]
      const services: any[] = []
      for (const shop of [s1, s2, s3]) {
        for (const inch of domesticInches) services.push({ shopId: shop.id, category: 'domestic', inch, price: 20000 + inch * 1000 })
        for (const inch of importInches) services.push({ shopId: shop.id, category: 'import', inch, price: 30000 + inch * 1500 })
      }
      await prisma.service.createMany({ data: services })
      console.log('Auto-seed completed: 3 shops, 48 services')
    }
  } catch (e) {
    console.warn('Auto-seed skipped:', (e as Error).message)
  }
}

autoSeed().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
})
