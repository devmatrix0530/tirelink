import { Router, Request, Response } from 'express'
import { prisma } from '../../main'

export const phoneRouter = Router()

phoneRouter.post('/send-code', async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body
    if (!phoneNumber || phoneNumber.replace(/[^0-9]/g, '').length < 10) {
      return res.status(400).json({ error: 'Invalid phone number' })
    }

    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '')
    const code = String(Math.floor(100000 + Math.random() * 900000))
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    await prisma.phoneVerification.create({
      data: { phoneNumber: cleanPhone, code, expiresAt }
    })

    // In production: call CoolSMS / 카카오 API here
    console.log(`[SMS] Code ${code} sent to ${cleanPhone}`)

    res.json({ message: 'Verification code sent', code }) // Remove `code` in production
  } catch (err) {
    res.status(500).json({ error: 'Failed to send code' })
  }
})

phoneRouter.post('/verify', async (req: Request, res: Response) => {
  try {
    const { phoneNumber, code } = req.body
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '')

    const verification = await prisma.phoneVerification.findFirst({
      where: {
        phoneNumber: cleanPhone,
        code,
        verified: false,
        expiresAt: { gte: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!verification) {
      return res.status(400).json({ error: 'Invalid or expired code' })
    }

    await prisma.phoneVerification.update({
      where: { id: verification.id },
      data: { verified: true }
    })

    res.json({ message: 'Phone number verified', phoneNumber: cleanPhone })
  } catch (err) {
    res.status(500).json({ error: 'Failed to verify code' })
  }
})
