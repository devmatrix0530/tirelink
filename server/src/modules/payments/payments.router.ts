import { Router, Request, Response } from 'express'
import { prisma } from '../../main'
import { requireAuth, requireRole, AuthRequest } from '../../common/middleware'

export const paymentsRouter = Router()

paymentsRouter.post('/billing-key', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { billingKey, pgProvider } = req.body
    const seller = await prisma.seller.findUnique({ where: { userId: req.userId! } })
    if (!seller) return res.status(404).json({ error: 'Seller not found' })

    await prisma.seller.update({
      where: { id: seller.id },
      data: { billingKey, billingStatus: 'active' }
    })
    res.json({ message: 'Billing key registered' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to register billing key' })
  }
})

paymentsRouter.post('/bill', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { sellerId } = req.body
    const seller = await prisma.seller.findUnique({ where: { id: sellerId } })
    if (!seller) return res.status(404).json({ error: 'Seller not found' })
    if (!seller.billingKey) return res.status(400).json({ error: 'No billing key registered' })

    // In production: call PortOne / iamport API to process billing
    // const result = await portone.pay(seller.billingKey, { amount: 50000, merchantUid: ... })
    // For now, simulate success:
    console.log(`[BILLING] Charged seller ${seller.name}: $50`)

    res.json({ message: 'Billing processed', amount: 50 })
  } catch (err) {
    res.status(500).json({ error: 'Billing failed' })
  }
})

paymentsRouter.post('/bill-all', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const activeSellers = await prisma.seller.findMany({
      where: { billingStatus: 'active', billingKey: { not: null } }
    })

    let charged = 0
    let failed = 0
    for (const seller of activeSellers) {
      try {
        console.log(`[BILLING] Charging ${seller.name}`)
        charged++
      } catch {
        failed++
      }
    }

    res.json({ message: 'Bulk billing complete', charged, failed })
  } catch (err) {
    res.status(500).json({ error: 'Bulk billing failed' })
  }
})

paymentsRouter.post('/webhook', async (req: Request, res: Response) => {
  try {
    const { imp_uid, merchant_uid, status } = req.body
    console.log(`[PAYMENT WEBHOOK] imp_uid: ${imp_uid}, status: ${status}`)
    res.json({ status: 'ok' })
  } catch (err) {
    res.status(500).json({ error: 'Webhook processing failed' })
  }
})
