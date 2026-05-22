import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, EmptyState, StatGroup, Stat, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@blinkdotnew/ui'
import { Wallet, CheckCircle2, TrendingUp, DollarSign, CalendarDays, Download } from 'lucide-react'
import { format, parseISO, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { api } from '../../lib/api'
import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../lib/utils'

const FEE_PER_BOOKING = 50000
type Period = 'this-month' | 'last-month' | 'last-3-months' | 'all'

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'this-month', label: 'This Month' },
  { value: 'last-month', label: 'Last Month' },
  { value: 'last-3-months', label: 'Last 3 Months' },
  { value: 'all', label: 'All Time' },
]

export default function OwnerSettlements() {
  const { user } = useAuth()
  const [period, setPeriod] = useState<Period>('this-month')

  const { data: shop } = useQuery({
    queryKey: ['my-shop', user?.id],
    queryFn: () => api.shops.list().then((shops: any) => shops.find((s: any) => s.userId === user?.id)),
    enabled: !!user,
  })

  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings', shop?.id],
    queryFn: () => api.bookings.list({ shopId: shop.id }),
    enabled: !!shop,
  })

  const filteredBookings = useMemo(() => {
    const completed = bookings.filter((b: any) => b.status === 'completed')
    const now = new Date()
    switch (period) {
      case 'this-month': return completed.filter((b: any) => { const d = parseISO(b.bookingDate); return d >= startOfMonth(now) && d <= endOfMonth(now) })
      case 'last-month': { const lm = subMonths(now, 1); return completed.filter((b: any) => { const d = parseISO(b.bookingDate); return d >= startOfMonth(lm) && d <= endOfMonth(lm) }) }
      case 'last-3-months': { const l3m = subMonths(now, 3); return completed.filter((b: any) => { const d = parseISO(b.bookingDate); return d >= l3m }) }
      default: return completed
    }
  }, [bookings, period])

  const totalAmount = filteredBookings.length * FEE_PER_BOOKING

  const stats = useMemo(() => {
    const now = new Date()
    const thisMonth = bookings.filter((b: any) => { const d = parseISO(b.bookingDate); return b.status === 'completed' && d >= startOfMonth(now) && d <= endOfMonth(now) })
    const lastMonth = bookings.filter((b: any) => { const d = parseISO(b.bookingDate); const lm = subMonths(now, 1); return b.status === 'completed' && d >= startOfMonth(lm) && d <= endOfMonth(lm) })
    const trend = lastMonth.length > 0 ? Math.round(((thisMonth.length - lastMonth.length) / lastMonth.length) * 100) : 0
    return { thisMonth: thisMonth.length, lastMonth: lastMonth.length, trend }
  }, [bookings])

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div><h1 className="text-3xl font-bold tracking-tight text-foreground">Settlements</h1><p className="text-muted-foreground mt-1">Track your labor fee earnings and completed work history.</p></div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={(v: Period) => setPeriod(v)}>
            <SelectTrigger className="w-[160px] h-10"><CalendarDays size={14} className="mr-2" /><SelectValue placeholder="Period" /></SelectTrigger>
            <SelectContent>{PERIOD_OPTIONS.map(o => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}</SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-10 gap-2"><Download size={14} /> Export</Button>
        </div>
      </div>

      <StatGroup className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat label="Total Earnings" value={`₩${totalAmount.toLocaleString()}`} description={`${filteredBookings.length} completed bookings`} icon={<DollarSign className="text-green-500" />} />
        <Stat label="This Month" value={stats.thisMonth.toString()} description={`${stats.lastMonth} last month`} trend={stats.trend} trendLabel="vs last month" icon={<TrendingUp className="text-primary" />} />
        <Stat label="Avg. per Booking" value={`₩${FEE_PER_BOOKING.toLocaleString()}`} description="Standard labor fee" icon={<Wallet className="text-amber-500" />} />
      </StatGroup>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg flex items-center gap-2"><CheckCircle2 className="text-green-500" size={18} /> Completed Work History</CardTitle>
          <Badge variant="secondary">{filteredBookings.length} bookings</Badge>
        </CardHeader>
        <CardContent>
          {filteredBookings.length > 0 ? (
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-4 py-2 text-xs font-bold text-muted-foreground border-b border-border"><span>Vehicle</span><span>Customer</span><span>Date</span><span className="text-right">Amount</span></div>
              {filteredBookings.map((booking: any, i: number) => (
                <div key={booking.id} className={cn('grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-4 py-3 rounded-lg items-center transition-colors', i % 2 === 0 ? 'bg-muted/20' : 'bg-card')}>
                  <span className="font-medium text-sm font-mono">{booking.vehicleNumber}</span>
                  <span className="text-sm text-muted-foreground">{booking.phoneNumber}</span>
                  <span className="text-sm text-muted-foreground">{format(parseISO(booking.bookingDate), 'MMM d, yyyy')}</span>
                  <span className="text-sm font-bold text-right text-green-500">₩{FEE_PER_BOOKING.toLocaleString()}</span>
                </div>
              ))}
              <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-4 py-3 border-t border-border font-bold"><span className="col-span-3">Total</span><span className="text-right text-green-500">₩{totalAmount.toLocaleString()}</span></div>
            </div>
          ) : (
            <EmptyState icon={<Wallet size={40} className="text-muted-foreground" />} title="No settlements yet" description="Completed bookings will appear here with their settlement amounts." />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
