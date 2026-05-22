import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { LayoutDashboard, Calendar, History, Settings, ChevronRight, Clock, Car, CheckCircle2 } from 'lucide-react';
import { Container, Card, CardContent, Badge, Button, DataTable, StatGroup, Stat, Persona, Input, toast } from '@blinkdotnew/ui';
import { api } from '../lib/api';
import { format } from 'date-fns';

export default function Dashboard() {
  const navigate = useNavigate();
  const [lookupPhone, setLookupPhone] = useState('')
  const [lookupRef, setLookupRef] = useState('')

  const { data: bookings = [], isLoading: isBookingsLoading } = useQuery({
    queryKey: ['bookings', lookupPhone],
    queryFn: () => api.bookings.list(lookupPhone ? { phoneNumber: lookupPhone } : undefined),
    enabled: !!lookupPhone,
  })

  const { data: referenceBooking, isLoading: isRefLoading } = useQuery({
    queryKey: ['booking-ref', lookupRef],
    queryFn: () => api.bookings.getByReference(lookupRef),
    enabled: lookupRef.length > 5,
  })

  const allBookings = bookings.length > 0 ? bookings : (referenceBooking ? [referenceBooking] : [])
  const upcomingBookings = allBookings.filter((b: any) => b.status === 'pending' || b.status === 'received')
  const pastBookings = allBookings.filter((b: any) => b.status === 'completed' || b.status === 'cancelled')

  const columns = [
    { accessorKey: 'shopId', header: 'Shop', cell: ({ row }: any) => {
      const shop = row.original.shop
      return <Persona name={shop?.name || 'Unknown Shop'} subtitle={shop?.address} />
    }},
    { accessorKey: 'vehicleNumber', header: 'Vehicle', cell: ({ row }: any) => (<div className="flex items-center gap-2"><Car className="h-4 w-4 text-muted-foreground" /><span className="font-mono font-bold">{row.original.vehicleNumber}</span></div>) },
    { accessorKey: 'bookingDate', header: 'Date & Time', cell: ({ row }: any) => (<div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /><span>{format(new Date(row.original.bookingDate), 'MMM d, h:mm a')}</span></div>) },
    { accessorKey: 'status', header: 'Status', cell: ({ row }: any) => {
      const status = row.original.status
      return <Badge variant={status === 'completed' ? 'secondary' : status === 'pending' ? 'outline' : status === 'cancelled' ? 'destructive' : 'default'}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
    }},
    { id: 'actions', cell: () => (<Button variant="ghost" size="icon"><ChevronRight className="h-4 w-4" /></Button>) }
  ]

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-md py-6">
        <Container>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div><h1 className="text-3xl font-bold flex items-center gap-2"><LayoutDashboard className="h-8 w-8 text-primary" /> My Dashboard</h1><p className="text-muted-foreground mt-1">Manage your tire service appointments and vehicle history.</p></div>
          </div>
        </Container>
      </div>

      <Container className="py-12 space-y-12">
        {/* Phone lookup card - since we don't have login for non-members */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold mb-2">Find Your Bookings</h2>
            <p className="text-sm text-muted-foreground mb-4">Enter your phone number or reference ID to look up your bookings.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input placeholder="Phone number (010-0000-0000)" value={lookupPhone} onChange={(e) => setLookupPhone(e.target.value)} className="h-10" />
              </div>
              <div className="flex-1">
                <Input placeholder="Reference ID (TRL-XXXXXXXXXX)" value={lookupRef} onChange={(e) => setLookupRef(e.target.value.toUpperCase())} className="h-10 font-mono" />
              </div>
            </div>
          </CardContent>
        </Card>

        {allBookings.length > 0 && (
          <>
            <StatGroup>
              <Stat label="Total Bookings" value={allBookings.length.toString()} icon={<History className="h-5 w-5 text-primary" />} />
              <Stat label="Upcoming" value={upcomingBookings.length.toString()} icon={<Clock className="h-5 w-5 text-primary" />} trend={upcomingBookings.length > 0 ? 1 : 0} trendLabel="Active appointments" />
              <Stat label="Completed" value={pastBookings.length.toString()} icon={<CheckCircle2 className="h-5 w-5 text-primary" />} />
            </StatGroup>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Upcoming Appointments</h2>
              <Card className="border-border">
                <CardContent className="p-0">
                  <DataTable columns={columns} data={upcomingBookings} loading={isBookingsLoading} />
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {allBookings.length === 0 && !lookupPhone && !lookupRef && (
          <Card className="border-dashed border-2 py-12 text-center">
            <CardContent>
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Look up your bookings</h3>
              <p className="text-muted-foreground mb-6">Enter your phone number or reference ID above to view your appointments.</p>
              <Button onClick={() => navigate({ to: '/find' })}>Find a Shop</Button>
            </CardContent>
          </Card>
        )}

        {allBookings.length === 0 && (lookupPhone || lookupRef) && !isBookingsLoading && !isRefLoading && (
          <Card className="border-dashed border-2 py-12 text-center">
            <CardContent>
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No bookings found</h3>
              <p className="text-muted-foreground mb-6">Check your phone number or reference ID and try again.</p>
              <Button onClick={() => navigate({ to: '/find' })}>Find a Shop</Button>
            </CardContent>
          </Card>
        )}
      </Container>
    </div>
  );
}
