import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, EmptyState } from '@blinkdotnew/ui'
import { ChevronLeft, ChevronRight, CalendarDays, Clock, AlertCircle, CheckCircle2, PackageCheck, User } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns'
import { api } from '../../lib/api'
import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../lib/utils'

function getStatusBadge(status: string) {
  switch (status) {
    case 'pending': return <Badge variant="outline" className="gap-1 text-[10px] h-5"><Clock size={10} /> Pending</Badge>
    case 'received': return <Badge variant="secondary" className="gap-1 text-[10px] h-5 bg-blue-500/10 text-blue-500 border-blue-500/20"><PackageCheck size={10} /> Received</Badge>
    case 'completed': return <Badge variant="default" className="gap-1 text-[10px] h-5 bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle2 size={10} /> Completed</Badge>
    case 'cancelled': return <Badge variant="destructive" className="gap-1 text-[10px] h-5"><AlertCircle size={10} /> Cancelled</Badge>
    default: return null
  }
}

export default function OwnerCalendar() {
  const { user } = useAuth()
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

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

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    return eachDayOfInterval({ start: startOfWeek(monthStart), end: endOfWeek(monthEnd) })
  }, [currentMonth])

  const selectedDayBookings = useMemo(() => {
    if (!selectedDate) return []
    return bookings.filter((b: any) => isSameDay(parseISO(b.bookingDate), selectedDate))
  }, [bookings, selectedDate])

  const getBookingsForDay = (day: Date) => bookings.filter((b: any) => isSameDay(parseISO(b.bookingDate), day))

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-3xl font-bold tracking-tight text-foreground">Schedule Calendar</h1><p className="text-muted-foreground mt-1">View and manage your monthly booking schedule.</p></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg flex items-center gap-2"><CalendarDays className="text-primary" size={18} /> {format(currentMonth, 'MMMM yyyy')}</CardTitle>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft size={16} /></Button>
              <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setCurrentMonth(startOfMonth(new Date()))}>Today</Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight size={16} /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (<div key={d} className="bg-muted/30 px-2 py-2 text-center text-xs font-bold text-muted-foreground">{d}</div>))}
              {calendarDays.map((day) => {
                const dayBookings = getBookingsForDay(day)
                const isCurrentMonth = isSameMonth(day, currentMonth)
                const isSelected = selectedDate && isSameDay(day, selectedDate)
                const isToday = isSameDay(day, new Date())
                return (
                  <button key={day.toISOString()} onClick={() => setSelectedDate(day)} className={cn('min-h-[90px] bg-card px-2 py-1.5 text-left transition-colors hover:bg-muted/50 relative group', !isCurrentMonth && 'opacity-40', isSelected && 'ring-2 ring-primary ring-inset')}>
                    <span className={cn('inline-flex items-center justify-center w-6 h-6 text-xs rounded-full', isToday && 'bg-primary text-primary-foreground font-bold', !isToday && 'text-foreground')}>{format(day, 'd')}</span>
                    <div className="mt-1 space-y-0.5">
                      {dayBookings.slice(0, 3).map((b: any) => (
                        <div key={b.id} className="flex items-center gap-1">
                          <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', b.status === 'pending' && 'bg-amber-500', b.status === 'received' && 'bg-blue-500', b.status === 'completed' && 'bg-green-500', b.status === 'cancelled' && 'bg-red-500')} />
                          <span className="text-[9px] text-muted-foreground truncate">{b.vehicleNumber}</span>
                        </div>
                      ))}
                      {dayBookings.length > 3 && <span className="text-[9px] text-primary font-medium">+{dayBookings.length - 3} more</span>}
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><CalendarDays size={14} className="text-primary" />{selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Select a day'}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {selectedDayBookings.length > 0 ? selectedDayBookings.map((booking: any) => (
              <div key={booking.id} className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0"><User size={14} /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2"><span className="text-sm font-bold">{booking.vehicleNumber}</span>{getStatusBadge(booking.status)}</div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2"><span>{format(parseISO(booking.bookingDate), 'h:mm a')}</span><span>·</span><span>{booking.phoneNumber}</span></div>
                </div>
              </div>
            )) : (
              <EmptyState icon={<CalendarDays size={32} className="text-muted-foreground" />} title="No bookings" description={selectedDate ? 'No bookings scheduled for this day.' : 'Select a day to view bookings.'} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
