import { Router, Request, Response } from 'express'
import { prisma } from '../../main'

export const reviewsRouter = Router()

reviewsRouter.get('/shop/:shopId', async (req: Request, res: Response) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { shopId: req.params.shopId },
      orderBy: { createdAt: 'desc' }
    })
    res.json(reviews)
  } catch {
    res.status(500).json({ error: 'Failed to fetch reviews' })
  }
})

reviewsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { shopId, author, rating, content } = req.body
    if (!shopId || !author || !content) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' })
    }

    const review = await prisma.review.create({
      data: { shopId, author: author.slice(0, 30), rating, content }
    })

    const reviews = await prisma.review.findMany({ where: { shopId } })
    const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    await prisma.shop.update({ where: { id: shopId }, data: { rating: Math.round(avgRating * 10) / 10 } })

    res.status(201).json(review)
  } catch {
    res.status(500).json({ error: 'Failed to create review' })
  }
})
