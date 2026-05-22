import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../../main'
import { generateToken, requireAuth, AuthRequest } from '../../common/middleware'

export const authRouter = Router()

authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { phoneNumber, password, name, role } = req.body
    const existing = await prisma.user.findUnique({ where: { phoneNumber } })
    if (existing) return res.status(400).json({ error: 'Phone number already registered' })

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { phoneNumber, passwordHash, name, role: role || 'customer' }
    })
    const token = generateToken(user.id, user.role)
    res.json({ token, user: { id: user.id, phoneNumber: user.phoneNumber, name: user.name, role: user.role } })
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' })
  }
})

authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { phoneNumber, password } = req.body
    const user = await prisma.user.findUnique({ where: { phoneNumber } })
    if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

    const token = generateToken(user.id, user.role)
    res.json({ token, user: { id: user.id, phoneNumber: user.phoneNumber, name: user.name, role: user.role } })
  } catch (err) {
    res.status(500).json({ error: 'Login failed' })
  }
})

authRouter.post('/phone-login', async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body
    let user = await prisma.user.findUnique({ where: { phoneNumber } })
    if (!user) {
      user = await prisma.user.create({ data: { phoneNumber, name: '', role: 'customer' } })
    }
    const token = generateToken(user.id, user.role)
    res.json({ token, user: { id: user.id, phoneNumber: user.phoneNumber, name: user.name, role: user.role } })
  } catch (err) {
    res.status(500).json({ error: 'Login failed' })
  }
})

authRouter.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { shop: true, seller: true }
    })
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({
      id: user.id,
      phoneNumber: user.phoneNumber,
      name: user.name,
      email: user.email,
      role: user.role,
      shop: user.shop,
      seller: user.seller
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to get user' })
  }
})

authRouter.put('/profile', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { name, email } = req.body
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { name, email }
    })
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' })
  }
})
