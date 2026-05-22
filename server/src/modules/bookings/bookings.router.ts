import { Router, Request, Response } from 'express'
import { prisma } from '../../main'
import { requireAuth, AuthRequest } from '../../common/middleware'
import { v4 as uuidv4 } from 'uuid'

export const bookingsRouter = Router()

bookingsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { phoneNumber, userId, shopId, status } = req.query
    const where: any = {}
    if (phoneNumber) where.phoneNumber = phoneNumber
    if (userId) where.userId = userId
    if (shopId) where.shopId = shopId
    if (status) where.status = status

    const bookings = await prisma.booking.findMany({
      where,
      include: { shop: true },
      orderBy: { bookingDate: 'desc' }
    })
    res.json(bookings)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings' })
  }
})

bookingsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { shop: true }
    })
    if (!booking) return res.status(404).json({ error: 'Booking not found' })
    res.json(booking)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch booking' })
  }
})

bookingsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { shopId, userId, vehicleNumber, phoneNumber, category, inch, bookingDate } = req.body
    const referenceId = uuidv4().replace(/-/g, '').toUpperCase().slice(0, 10)

    const booking = await prisma.booking.create({
      data: {
        shopId,
        userId,
        vehicleNumber,
        phoneNumber,
        category,
        inch: inch ? parseInt(inch) : null,
        bookingDate: new Date(bookingDate),
        referenceId: `TRL-${referenceId}`,
        status: 'pending'
      },
      include: { shop: true }
    })

    // Auto-send Kakao notification in production
    try {
      await fetch(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/notifications/booking-confirmed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id }),
        signal: AbortSignal.timeout(3000)
      }).catch(() => {})
    } catch {}

    res.status(201).json(booking)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create booking' })
  }
})

bookingsRouter.patch('/:id/status', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body
    const validStatuses = ['pending', 'received', 'completed', 'cancelled']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status }
    })
    res.json(booking)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update booking status' })
  }
})

bookingsRouter.get('/reference/:referenceId', async (req: Request, res: Response) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { referenceId: req.params.referenceId },
      include: { shop: true }
    })
    if (!booking) return res.status(404).json({ error: 'Booking not found' })
    res.json(booking)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch booking' })
  }
})
