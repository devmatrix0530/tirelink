import { Router, Request, Response } from 'express'
import { prisma } from '../../main'
import { requireAuth, requireRole, AuthRequest } from '../../common/middleware'
import { v4 as uuidv4 } from 'uuid'

export const sellersRouter = Router()

sellersRouter.get('/', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const sellers = await prisma.seller.findMany({ include: { user: true } })
    res.json(sellers)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sellers' })
  }
})

sellersRouter.get('/my', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const seller = await prisma.seller.findUnique({
      where: { userId: req.userId! },
      include: { user: true }
    })
    if (!seller) return res.status(404).json({ error: 'Seller profile not found' })
    res.json(seller)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch seller profile' })
  }
})

sellersRouter.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, storeUrl } = req.body
    const existing = await prisma.seller.findUnique({ where: { userId: req.userId! } })
    if (existing) return res.status(400).json({ error: 'Seller profile already exists' })

    const widgetCode = uuidv4().replace(/-/g, '').slice(0, 12)
    const seller = await prisma.seller.create({
      data: { userId: req.userId!, name, email, storeUrl, widgetCode }
    })
    res.json(seller)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create seller profile' })
  }
})

sellersRouter.patch('/:id/status', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body
    const seller = await prisma.seller.update({
      where: { id: req.params.id },
      data: { status }
    })
    res.json(seller)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update seller status' })
  }
})

sellersRouter.patch('/:id/billing', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { billingStatus } = req.body
    const seller = await prisma.seller.update({
      where: { id: req.params.id },
      data: { billingStatus }
    })
    res.json(seller)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update billing status' })
  }
})

sellersRouter.get('/widget/:code', async (req: Request, res: Response) => {
  try {
    const seller = await prisma.seller.findUnique({
      where: { widgetCode: req.params.code },
      include: { user: { include: { shop: true } } }
    })
    if (!seller) return res.status(404).json({ error: 'Widget not found' })
    res.json(seller)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch widget data' })
  }
})
