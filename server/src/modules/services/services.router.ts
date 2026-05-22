import { Router, Request, Response } from 'express'
import { prisma } from '../../main'
import { requireAuth, AuthRequest } from '../../common/middleware'

export const servicesRouter = Router()

servicesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { shopId } = req.query
    const where = shopId ? { shopId: shopId as string } : {}
    const services = await prisma.service.findMany({ where })
    res.json(services)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch services' })
  }
})

servicesRouter.get('/shop/:shopId', async (req: Request, res: Response) => {
  try {
    const services = await prisma.service.findMany({ where: { shopId: req.params.shopId } })
    res.json(services)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch services' })
  }
})

servicesRouter.post('/bulk', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { shopId, services: servicesData } = req.body
    const shop = await prisma.shop.findUnique({ where: { id: shopId } })
    if (!shop) return res.status(404).json({ error: 'Shop not found' })
    if (shop.userId !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' })
    }

    await prisma.service.deleteMany({ where: { shopId } })
    const created = await prisma.service.createMany({
      data: servicesData.map((s: { category: string; inch: number; price: number }) => ({
        shopId, category: s.category, inch: s.inch, price: s.price
      }))
    })
    res.json({ message: 'Services updated', count: created.count })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update services' })
  }
})
