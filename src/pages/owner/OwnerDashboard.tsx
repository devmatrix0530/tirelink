import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { StatGroup, Stat, Card, CardHeader, CardTitle, CardContent, Badge, Button, DataTable, Persona, EmptyState, toast } from '@blinkdotnew/ui'
import { Calendar as CalendarIcon, CheckCircle2, Clock, AlertCircle, ChevronLeft, ChevronRight, TrendingUp, Wallet, CheckCircle, PackageCheck, User } from 'lucide-react'
import { format, addDays, startOfToday, isSameDay, parseISO } from 'date-fns'
import { api } from '../../lib/api'
import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../lib/utils'

export default function OwnerDashboard() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday())
  const [weekOffset, setWeekOffset] = useState(0)
  const navigate = useNavigate()

  const { data: shop } = useQuery({
    queryKey: ['my-shop', user?.id],
    queryFn: () => api.shops.list().then((shops: any) => shops.find((s: any) => s.userId === user?.id)),
    enabled: !!user,
  })

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings', shop?.id],
    queryFn: () => api.bookings.list({ shopId: shop.id }),
    enabled: !!shop,
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.bookings.updateStatus(id, status),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bookings'] }); toast.success('Status updated'); },
    onError: () => { toast.error('Failed to update status'); }
  })

  const todayBookings = useMemo(() => bookings.filter((b: any) => isSameDay(parseISO(b.bookingDate), startOfToday())), [bookings])
  const selectedDayBookings = useMemo(() => bookings.filter((b: any) => isSameDay(parseISO(b.bookingDate), selectedDate)), [bookings, selectedDate])

  const revenueToday = useMemo(() => todayBookings.filter((b: any) => b.status === 'completed' || b.status === 'received').length * 50000, [todayBookings])
  const pendingSettlements = useMemo(() => bookings.filter((b: any) => b.status === 'received').length * 50000, [bookings])

  const calendarDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(startOfToday(), i + weekOffset * 7)), [weekOffset])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="gap-1"><Clock size={12} /> Pending</Badge>
      case 'received': return <Badge variant="secondary" className="gap-1 bg-blue-500/10 text-blue-500 border-blue-500/20"><PackageCheck size={12} /> Received</Badge>
      case 'completed': return <Badge variant="default" className="gap-1 bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle2 size={12} /> Completed</Badge>
      case 'cancelled': return <Badge variant="destructive" className="gap-1"><AlertCircle size={12} /> Cancelled</Badge>
      default: return null
    }
  }

  const columns = [
    { accessorKey: 'vehicleNumber', header: 'Vehicle', cell: ({ row }: any) => (<div className="font-medium text-foreground">{row.getValue('vehicleNumber')}</div>) },
    { accessorKey: 'phoneNumber', header: 'Customer', cell: ({ row }: any) => (<div className="flex items-center gap-2"><Persona name={row.getValue('phoneNumber')} subtitle="Customer" /></div>) },
    { accessorKey: 'status', header: 'Status', cell: ({ row }: any) => getStatusBadge(row.getValue('status')) },
    { id: 'actions', header: 'Actions', cell: ({ row }: any) => {
      const booking = row.original
      return (<div className="flex items-center gap-2">
        {booking.status === 'pending' && <Button size="sm" variant="outline" className="h-8 px-2 text-xs" onClick={() => updateStatusMutation.mutate({ id: booking.id, status: 'received' })}>Receive</Button>}
        {booking.status === 'received' && <Button size="sm" className="h-8 px-2 text-xs bg-green-600 hover:bg-green-700" onClick={() => updateStatusMutation.mutate({ id: booking.id, status: 'completed' })}>Complete</Button>}
      </div>)
    }}
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div><h1 className="text-3xl font-bold tracking-tight text-foreground">Owner Dashboard</h1><p className="text-muted-foreground mt-1">Manage your shop's operations and track bookings in real-time.</p></div>
          <div className="flex items-center gap-2 bg-card p-1 rounded-lg border border-border">
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={() => navigate({ to: '/owner/analytics' })}><TrendingUp size={14} className="text-primary" /> Reports</Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={() => navigate({ to: '/owner/settlements' })}><Wallet size={14} className="text-primary" /> Payouts</Button>
          </div>
      </div>

      <StatGroup className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat label="Revenue Today" value={`₩${revenueToday.toLocaleString()}`} trend={12} trendLabel="vs yesterday" icon={<TrendingUp className="text-primary" />} />
        <Stat label="Pending Settlements" value={`₩${pendingSettlements.toLocaleString()}`} description="Awaiting completion" icon={<Wallet className="text-amber-500" />} />
        <Stat label="Total Arrivals Today" value={todayBookings.length.toString()} description={`${todayBookings.filter((b: any) => b.status === 'completed').length} completed`} icon={<CheckCircle className="text-green-500" />} />
      </StatGroup>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-primary/20 shadow-lg shadow-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div><CardTitle className="text-lg flex items-center gap-2"><Clock className="text-primary" size={18} /> Arriving Today</CardTitle><p className="text-sm text-muted-foreground">Monitor and update status of incoming vehicles</p></div>
            <Badge variant="secondary">{todayBookings.length} Bookings</Badge>
          </CardHeader>
          <CardContent>
            {todayBookings.length > 0 ? <DataTable columns={columns} data={todayBookings} /> : (
              <EmptyState icon={<Clock size={40} className="text-muted-foreground" />} title="No arrivals today" description="Check other dates in the calendar for future bookings." />
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4"><CardTitle className="text-lg flex items-center gap-2"><CalendarIcon className="text-primary" size={18} /> Booking Calendar</CardTitle></CardHeader>
            <CardContent className="px-0">
              <div className="flex items-center justify-between px-4 mb-4">
                <span className="text-sm font-medium">{format(selectedDate, 'MMMM yyyy')}</span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setWeekOffset(o => o - 1)}><ChevronLeft size={14} /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setWeekOffset(o => o + 1)}><ChevronRight size={14} /></Button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 px-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (<div key={i} className="text-[10px] font-bold text-center text-muted-foreground py-1">{d}</div>))}
                {calendarDays.map((date, i) => {
                  const hasBookings = bookings.some((b: any) => isSameDay(parseISO(b.bookingDate), date))
                  const isSelected = isSameDay(date, selectedDate)
                  return (
                    <button key={i} onClick={() => setSelectedDate(date)} className={cn("relative flex flex-col items-center justify-center p-2 rounded-md transition-all", isSelected ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "hover:bg-muted/50 text-foreground")}>
                      <span className="text-sm font-semibold">{format(date, 'd')}</span>
                      {hasBookings && !isSelected && <span className="absolute bottom-1 w-1 h-1 bg-primary rounded-full" />}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/20 border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>Bookings for {format(selectedDate, 'MMM d')}</span>
                <Badge variant="outline" className="text-[10px]">{selectedDayBookings.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedDayBookings.length > 0 ? selectedDayBookings.map((booking: any) => (
                <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary"><User size={14} /></div>
                    <div><div className="text-xs font-bold">{booking.vehicleNumber}</div><div className="text-[10px] text-muted-foreground">{format(parseISO(booking.bookingDate), 'h:mm a')}</div></div>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>
              )) : (
                <div className="text-center py-8"><p className="text-xs text-muted-foreground">No bookings scheduled for this day.</p></div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
