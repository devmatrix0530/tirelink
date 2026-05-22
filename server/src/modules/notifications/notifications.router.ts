import { Router, Request, Response } from 'express'
import { prisma } from '../../main'
import { requireAuth, AuthRequest } from '../../common/middleware'

export const notificationsRouter = Router()

notificationsRouter.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user
    let where: any = {}

    if (user?.role === 'owner') {
      const shop = await prisma.shop.findUnique({ where: { userId: user.id } })
      if (shop) where.shopId = shop.id
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50
    })
    res.json(notifications)
  } catch {
    res.status(500).json({ error: 'Failed to fetch notifications' })
  }
})

notificationsRouter.post('/booking-confirmed', async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.body
    const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { shop: true } })
    if (!booking) return res.status(404).json({ error: 'Booking not found' })

    await prisma.notification.create({
      data: {
        shopId: booking.shopId,
        type: 'booking',
        message: `New booking: ${booking.vehicleNumber} on ${booking.bookingDate.toISOString().slice(0, 10)}`
      }
    })
    await prisma.booking.update({ where: { id: bookingId }, data: { kakaoSent: true } })

    res.json({ message: 'Notification created' })
  } catch {
    res.status(500).json({ error: 'Failed to create notification' })
  }
})

notificationsRouter.post('/status-update', async (req: Request, res: Response) => {
  try {
    const { bookingId, status } = req.body
    const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { shop: true } })
    if (!booking) return res.status(404).json({ error: 'Booking not found' })

    await prisma.notification.create({
      data: {
        shopId: booking.shopId,
        type: 'status',
        message: `Booking ${booking.referenceId}: status changed to ${status}`
      }
    })
    res.json({ message: 'Notification created' })
  } catch {
    res.status(500).json({ error: 'Failed to create notification' })
  }
})

notificationsRouter.get('/shop/:shopId', async (req: Request, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { shopId: req.params.shopId },
      orderBy: { createdAt: 'desc' },
      take: 50
    })
    res.json(notifications)
  } catch {
    res.status(500).json({ error: 'Failed to fetch notifications' })
  }
})

notificationsRouter.patch('/:id/read', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.update({ where: { id: req.params.id }, data: { read: true } })
    res.json({ message: 'Notification marked as read' })
  } catch {
    res.status(500).json({ error: 'Failed to update notification' })
  }
})

notificationsRouter.get('/shop/:shopId/unread-count', async (req: Request, res: Response) => {
  try {
    const count = await prisma.notification.count({
      where: { shopId: req.params.shopId, read: false }
    })
    res.json({ count })
  } catch {
    res.status(500).json({ error: 'Failed to count notifications' })
  }
})
