import { Router, Request, Response } from 'express'
import { prisma } from '../../main'
import { requireAuth, requireRole, AuthRequest } from '../../common/middleware'

export const shopsRouter = Router()

shopsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { lat, lng, radius } = req.query
    let shops = await prisma.shop.findMany({
      where: { active: true },
      include: { services: true }
    })

    if (lat && lng) {
      const userLat = parseFloat(lat as string)
      const userLng = parseFloat(lng as string)
      const maxRadius = radius ? parseInt(radius as string) : 50

      shops = shops.filter(shop => {
        const dist = haversine(userLat, userLng, shop.latitude, shop.longitude)
        return dist <= maxRadius
      })

      shops.sort((a, b) => {
        const distA = haversine(userLat, userLng, a.latitude, a.longitude)
        const distB = haversine(userLat, userLng, b.latitude, b.longitude)
        return distA - distB
      })
    }

    res.json(shops)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch shops' })
  }
})

shopsRouter.get('/all', requireAuth, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const shops = await prisma.shop.findMany({ include: { services: true, user: true } })
    res.json(shops)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch shops' })
  }
})

shopsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const shop = await prisma.shop.findUnique({
      where: { id: req.params.id },
      include: { services: true }
    })
    if (!shop) return res.status(404).json({ error: 'Shop not found' })
    res.json(shop)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch shop' })
  }
})

shopsRouter.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { name, address, latitude, longitude, liftCount, openingHours, imageUrl } = req.body
    const shop = await prisma.shop.create({
      data: {
        name, address, latitude, longitude,
        liftCount: liftCount || 2,
        openingHours: openingHours || '09:00 - 18:00',
        imageUrl: imageUrl || '',
        userId: req.userId,
        active: false
      }
    })
    res.json(shop)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create shop' })
  }
})

shopsRouter.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const shop = await prisma.shop.findUnique({ where: { id: req.params.id } })
    if (!shop) return res.status(404).json({ error: 'Shop not found' })
    if (shop.userId !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' })
    }

    const updated = await prisma.shop.update({
      where: { id: req.params.id },
      data: req.body
    })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update shop' })
  }
})

shopsRouter.post('/:id/approve', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const shop = await prisma.shop.update({
      where: { id: req.params.id },
      data: { active: true }
    })
    res.json(shop)
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve shop' })
  }
})

shopsRouter.delete('/:id', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    await prisma.shop.delete({ where: { id: req.params.id } })
    res.json({ message: 'Shop deleted' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete shop' })
  }
})

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
