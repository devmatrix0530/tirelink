import { Router, Request, Response } from 'express'
import { prisma } from '../../main'
import { requireAuth, AuthRequest } from '../../common/middleware'

export const analyticsRouter = Router()

analyticsRouter.get('/shop/:shopId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { shopId } = req.params
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    const bookings = await prisma.booking.findMany({ where: { shopId } })
    const reviews = await prisma.review.findMany({ where: { shopId } })

    const totalBookings = bookings.length
    const completedBookings = bookings.filter(b => b.status === 'completed').length
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length
    const thisMonthBookings = bookings.filter(b => new Date(b.createdAt) >= startOfMonth).length
    const lastMonthBookings = bookings.filter(b => {
      const d = new Date(b.createdAt)
      return d >= startOfLastMonth && d <= endOfLastMonth
    }).length

    const monthlyRevenue = completedBookings * 50000
    const completionRate = totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0
    const avgRating = reviews.length > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
      : 0
    const bookingTrend = lastMonthBookings > 0
      ? Math.round(((thisMonthBookings - lastMonthBookings) / lastMonthBookings) * 100)
      : 0

    res.json({
      totalBookings,
      completedBookings,
      cancelledBookings,
      thisMonthBookings,
      lastMonthBookings,
      bookingTrend,
      monthlyRevenue,
      completionRate,
      avgRating,
      totalReviews: reviews.length,
    })
  } catch {
    res.status(500).json({ error: 'Failed to fetch analytics' })
  }
})

analyticsRouter.get('/admin', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const totalShops = await prisma.shop.count()
    const activeShops = await prisma.shop.count({ where: { active: true } })
    const pendingShops = await prisma.shop.count({ where: { active: false } })
    const totalBookings = await prisma.booking.count()
    const totalSellers = await prisma.seller.count()
    const activeSellers = await prisma.seller.count({ where: { status: 'active' } })

    res.json({ totalShops, activeShops, pendingShops, totalBookings, totalSellers, activeSellers })
  } catch {
    res.status(500).json({ error: 'Failed to fetch admin analytics' })
  }
})
