import { useQuery } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent, StatGroup, Stat } from '@blinkdotnew/ui'
import { Store, Users, CalendarCheck, TrendingUp, Activity } from 'lucide-react'
import { api } from '../../lib/api'

export default function AdminDashboard() {
  const { data: shops = [] } = useQuery({
    queryKey: ['admin-shops'],
    queryFn: () => api.shops.listAll(),
  })

  const { data: bookings = [] } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: () => api.bookings.list(),
  })

  const pendingShops = shops.filter((s: any) => !s.active).length
  const totalBookings = bookings.length
  const completedBookings = bookings.filter((b: any) => b.status === 'completed').length
  const activeShops = shops.filter((s: any) => s.active).length
  const pendingBookings = bookings.filter((b: any) => b.status === 'pending').length

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of the TireLink platform ecosystem.</p>
      </div>

      <StatGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Total Shops" value={shops.length.toString()} icon={<Store className="text-primary" />} />
        <Stat label="Active Shops" value={activeShops.toString()} icon={<Activity className="text-green-500" />} />
        <Stat label="Pending Approval" value={pendingShops.toString()} icon={<Users className="text-amber-500" />} />
        <Stat label="Total Bookings" value={totalBookings.toString()} description={`${completedBookings} completed`} icon={<CalendarCheck className="text-blue-500" />} />
      </StatGroup>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Store className="text-primary" size={18} /> Shop Overview</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {shops.slice(0, 5).map((shop: any) => (
              <div key={shop.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <div><div className="text-sm font-medium">{shop.name}</div><div className="text-xs text-muted-foreground">{shop.address}</div></div>
                <span className="text-xs text-muted-foreground">{shop.liftCount} lifts</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="text-primary" size={18} /> Recent Activity</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20"><span className="text-sm">Pending shop approvals</span><span className="text-lg font-bold text-amber-500">{pendingShops}</span></div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20"><span className="text-sm">Active bookings</span><span className="text-lg font-bold text-blue-500">{pendingBookings}</span></div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20"><span className="text-sm">Completed bookings</span><span className="text-lg font-bold text-green-500">{completedBookings}</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
