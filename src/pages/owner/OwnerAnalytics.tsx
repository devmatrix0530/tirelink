import { useQuery } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent, StatGroup, Stat, Badge, EmptyState } from '@blinkdotnew/ui'
import { TrendingUp, CalendarCheck, XCircle, Star, DollarSign, BarChart3, Activity, ArrowUp, ArrowDown } from 'lucide-react'
import { api } from '../../lib/api'
import { useAuth } from '../../hooks/useAuth'

export default function OwnerAnalytics() {
  const { user } = useAuth()

  const { data: shop } = useQuery({
    queryKey: ['my-shop', user?.id],
    queryFn: () => api.shops.list().then((shops: any) => shops.find((s: any) => s.userId === user?.id)),
    enabled: !!user,
  })

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', shop?.id],
    queryFn: () => fetch(`http://localhost:4000/api/analytics/shop/${shop.id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('tirelink_token')}` }
    }).then(r => r.json()),
    enabled: !!shop,
  })

  if (isLoading) {
    return <div className="space-y-6 animate-fade-in"><div className="grid grid-cols-1 md:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => (<Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-4 bg-muted rounded w-1/2 mb-2" /><div className="h-8 bg-muted rounded w-1/3" /></CardContent></Card>))}</div></div>
  }

  if (!analytics) {
    return <div className="p-8 text-center text-muted-foreground">No analytics data available yet.</div>
  }

  const trendIcon = analytics.bookingTrend > 0 ? <ArrowUp className="h-4 w-4 text-green-500" /> : <ArrowDown className="h-4 w-4 text-red-500" />

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2"><BarChart3 className="text-primary" /> Analytics</h1>
        <p className="text-muted-foreground mt-1">Comprehensive insights into your shop's performance.</p>
      </div>

      <StatGroup className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat label="Total Bookings" value={analytics.totalBookings.toString()} icon={<CalendarCheck className="text-primary" />} />
        <Stat label="Completion Rate" value={`${analytics.completionRate}%`} icon={<Activity className="text-green-500" />} />
        <Stat label="Avg Rating" value={analytics.avgRating > 0 ? analytics.avgRating.toFixed(1) : 'N/A'} icon={<Star className="text-amber-500" />} />
      </StatGroup>

      <StatGroup className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat label="Monthly Revenue" value={`₩${analytics.monthlyRevenue.toLocaleString()}`} icon={<DollarSign className="text-green-500" />} />
        <Stat label="This Month" value={analytics.thisMonthBookings.toString()} icon={<TrendingUp className="text-primary" />} trend={analytics.bookingTrend} trendLabel="vs last month" />
        <Stat label="Cancelled" value={analytics.cancelledBookings.toString()} icon={<XCircle className="text-red-500" />} />
      </StatGroup>

      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="text-primary" size={18} /> Monthly Comparison</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 rounded-xl border border-border bg-card/50">
              <p className="text-sm text-muted-foreground mb-2">Last Month</p>
              <p className="text-3xl font-bold">{analytics.lastMonthBookings}</p>
              <p className="text-xs text-muted-foreground mt-1">bookings</p>
            </div>
            <div className="p-6 rounded-xl border border-primary/20 bg-primary/5">
              <p className="text-sm text-muted-foreground mb-2">This Month</p>
              <p className="text-3xl font-bold text-primary">{analytics.thisMonthBookings}</p>
              <div className="flex items-center gap-1 mt-1 text-xs">
                {trendIcon}
                <span className={analytics.bookingTrend >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {Math.abs(analytics.bookingTrend)}% vs last month
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Activity className="text-primary" size={18} /> Booking Breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><div className="flex justify-between text-sm mb-1"><span>Completed</span><span className="font-bold text-green-500">{analytics.completedBookings}</span></div><div className="h-2 bg-secondary rounded-full overflow-hidden"><div className="h-full bg-green-500 rounded-full" style={{ width: `${analytics.totalBookings > 0 ? (analytics.completedBookings / analytics.totalBookings) * 100 : 0}%` }} /></div></div>
            <div><div className="flex justify-between text-sm mb-1"><span>Cancelled</span><span className="font-bold text-red-500">{analytics.cancelledBookings}</span></div><div className="h-2 bg-secondary rounded-full overflow-hidden"><div className="h-full bg-red-500 rounded-full" style={{ width: `${analytics.totalBookings > 0 ? (analytics.cancelledBookings / analytics.totalBookings) * 100 : 0}%` }} /></div></div>
            <div><div className="flex justify-between text-sm mb-1"><span>Pending / Received</span><span className="font-bold text-amber-500">{analytics.totalBookings - analytics.completedBookings - analytics.cancelledBookings}</span></div><div className="h-2 bg-secondary rounded-full overflow-hidden"><div className="h-full bg-amber-500 rounded-full" style={{ width: `${analytics.totalBookings > 0 ? ((analytics.totalBookings - analytics.completedBookings - analytics.cancelledBookings) / analytics.totalBookings) * 100 : 0}%` }} /></div></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Star className="text-primary" size={18} /> Reviews Overview</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-5xl font-bold text-primary">{analytics.avgRating > 0 ? analytics.avgRating.toFixed(1) : '-'}</div>
              <div>
                <div className="flex gap-0.5 mb-1">{Array.from({ length: 5 }).map((_, i) => (<Star key={i} className={`h-4 w-4 ${i < Math.round(analytics.avgRating) ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />))}</div>
                <p className="text-xs text-muted-foreground">{analytics.totalReviews} review{analytics.totalReviews !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
