import { useQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { Card, CardContent, Button, Badge } from '@blinkdotnew/ui'
import { Car, Clock, ShieldCheck, MapPin, ChevronRight } from 'lucide-react'
import { api } from '../lib/api'

export default function Widget() {
  const { shopId } = useParams({ from: '/widget/$shopId' })

  const { data: shop, isLoading } = useQuery({
    queryKey: ['shop', shopId],
    queryFn: () => api.shops.get(shopId),
  })

  if (isLoading) {
    return (<div className="p-2 h-full bg-transparent"><Card className="animate-pulse h-full"><CardContent className="p-4 flex gap-4"><div className="h-16 w-16 bg-muted rounded" /><div className="flex-1 space-y-2"><div className="h-4 bg-muted rounded w-1/2" /><div className="h-3 bg-muted rounded w-3/4" /></div></CardContent></Card></div>)
  }

  if (!shop) return null

  return (
    <div className="p-2 h-full bg-transparent">
      <Card className="border-border shadow-md hover:shadow-lg transition-all group overflow-hidden bg-card/90 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest text-primary border-primary/20 bg-primary/5">Partner Shop</Badge>
                <div className="flex items-center text-amber-500 text-[10px] font-bold">★ {shop.rating}</div>
              </div>
              <h3 className="font-bold text-base truncate group-hover:text-primary transition-colors">{shop.name}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3"><MapPin className="h-3 w-3" /> {shop.address}</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground"><Car className="h-3 w-3 text-primary" /> {shop.liftCount} Lifts</div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground"><Clock className="h-3 w-3 text-primary" /> {shop.openingHours}</div>
              </div>
            </div>
            <div className="h-16 w-16 shrink-0 rounded-lg overflow-hidden border border-border"><img src={shop.imageUrl} alt={shop.name} className="h-full w-full object-cover" /></div>
          </div>
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-border mt-1">
            <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-600"><ShieldCheck className="h-3 w-3" /> TireLink Verified</div>
            <a href={`/shop/${shop.id}`} target="_blank"><Button size="sm" className="h-8 text-xs font-bold gap-1 px-4">Book Installation <ChevronRight className="h-3 w-3" /></Button></a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
