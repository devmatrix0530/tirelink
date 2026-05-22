import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const shop1 = await prisma.shop.create({
    data: {
      name: 'Speed Tire Center',
      address: '123 Gangnam-daero, Seoul',
      latitude: 37.5,
      longitude: 127.0,
      liftCount: 4,
      openingHours: '09:00 - 18:00',
      rating: 4.5,
      imageUrl: 'https://images.unsplash.com/photo-1580674285054-bed31eacf5f4?w=800',
      active: true
    }
  })

  const shop2 = await prisma.shop.create({
    data: {
      name: 'Pro Auto Service',
      address: '456 Teheran-ro, Seoul',
      latitude: 37.51,
      longitude: 127.02,
      liftCount: 2,
      openingHours: '08:00 - 20:00',
      rating: 4.2,
      imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800',
      active: true
    }
  })

  const shop3 = await prisma.shop.create({
    data: {
      name: 'Premium Tire & Wheel',
      address: '789 Yangjae-daero, Seoul',
      latitude: 37.48,
      longitude: 127.05,
      liftCount: 6,
      openingHours: '09:30 - 19:00',
      rating: 4.8,
      imageUrl: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800',
      active: true
    }
  })

  const shop4 = await prisma.shop.create({
    data: {
      name: 'New Auto Workshop',
      address: '321 Mapo-gu, Seoul',
      latitude: 37.55,
      longitude: 126.92,
      liftCount: 3,
      openingHours: '09:00 - 18:00',
      rating: 0,
      imageUrl: '',
      active: false
    }
  })

  const domesticPrices = [
    { inch: 13, price: 25000 },
    { inch: 14, price: 30000 },
    { inch: 15, price: 35000 },
    { inch: 16, price: 40000 },
    { inch: 17, price: 45000 },
    { inch: 18, price: 50000 },
    { inch: 19, price: 55000 },
    { inch: 20, price: 60000 },
  ]

  const importPrices = [
    { inch: 15, price: 45000 },
    { inch: 16, price: 50000 },
    { inch: 17, price: 55000 },
    { inch: 18, price: 60000 },
    { inch: 19, price: 70000 },
    { inch: 20, price: 80000 },
    { inch: 21, price: 90000 },
    { inch: 22, price: 100000 },
  ]

  const shops = [shop1, shop2, shop3]
  for (const shop of shops) {
    for (const p of domesticPrices) {
      await prisma.service.create({
        data: { shopId: shop.id, category: 'domestic', inch: p.inch, price: p.price }
      })
    }
    for (const p of importPrices) {
      await prisma.service.create({
        data: { shopId: shop.id, category: 'import', inch: p.inch, price: p.price }
      })
    }
  }

  console.log('Seed completed')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
