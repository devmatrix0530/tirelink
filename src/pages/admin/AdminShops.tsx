import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, EmptyState, StatGroup, Stat, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, toast } from '@blinkdotnew/ui'
import { Store, Search, CheckCircle2, XCircle, Clock, MapPin, Star } from 'lucide-react'
import { api } from '../../lib/api'
import { cn } from '../../lib/utils'

type ApprovalStatus = 'all' | 'pending' | 'approved'

export default function AdminShops() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<ApprovalStatus>('all')

  const { data: shops = [] } = useQuery({
    queryKey: ['admin-shops'],
    queryFn: () => api.shops.listAll(),
  })

  const approveMutation = useMutation({
    mutationFn: (shopId: string) => api.shops.approve(shopId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-shops'] }); toast.success('Shop approved'); },
    onError: () => { toast.error('Failed to approve shop'); }
  })

  const deleteMutation = useMutation({
    mutationFn: (shopId: string) => api.shops.delete(shopId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-shops'] }); toast.success('Shop rejected'); },
    onError: () => { toast.error('Failed to reject shop'); }
  })

  const filteredShops = useMemo(() => {
    return shops.filter((shop: any) => {
      const matchesSearch = shop.name.toLowerCase().includes(searchQuery.toLowerCase()) || shop.address.toLowerCase().includes(searchQuery.toLowerCase())
      const isPending = !shop.active
      const matchesStatus = filterStatus === 'all' ? true : filterStatus === 'pending' ? isPending : !isPending
      return matchesSearch && matchesStatus
    })
  }, [shops, searchQuery, filterStatus])

  const pendingCount = shops.filter((s: any) => !s.active).length
  const approvedCount = shops.filter((s: any) => s.active).length

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Shop Management</h1>
        <p className="text-muted-foreground mt-1">Approve new shops and manage partner infrastructure data.</p>
      </div>

      <StatGroup className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat label="Total Shops" value={shops.length.toString()} icon={<Store className="text-primary" />} />
        <Stat label="Approved" value={approvedCount.toString()} icon={<CheckCircle2 className="text-green-500" />} />
        <Stat label="Pending" value={pendingCount.toString()} icon={<Clock className="text-amber-500" />} />
      </StatGroup>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-lg">All Shops</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search shops..." className="pl-9 h-9 w-[200px]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <Select value={filterStatus} onValueChange={(v: ApprovalStatus) => setFilterStatus(v)}>
                <SelectTrigger className="w-[130px] h-9"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="approved">Approved</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredShops.length > 0 ? (
            <div className="space-y-3">
              {filteredShops.map((shop: any) => {
                const isPending = !shop.active
                return (
                  <div key={shop.id} className={cn('flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-lg border transition-colors', isPending ? 'border-amber-500/30 bg-amber-500/5' : 'border-border bg-card')}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-sm">{shop.name}</h3>
                        {isPending ? <Badge variant="outline" className="text-[10px] border-amber-500 text-amber-500">Pending</Badge> : <Badge variant="outline" className="text-[10px] border-green-500 text-green-500">Approved</Badge>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin size={12} /> {shop.address}</span>
                        <span>{shop.liftCount} lifts</span>
                        {shop.rating > 0 && <span className="flex items-center gap-1"><Star size={12} /> {shop.rating}</span>}
                      </div>
                    </div>
                    {isPending && (
                      <div className="flex items-center gap-2 shrink-0">
                        <Button size="sm" className="h-8 gap-1" onClick={() => approveMutation.mutate(shop.id)} disabled={approveMutation.isPending}><CheckCircle2 size={14} /> Approve</Button>
                        <Button size="sm" variant="outline" className="h-8 gap-1 text-destructive" onClick={() => deleteMutation.mutate(shop.id)} disabled={deleteMutation.isPending}><XCircle size={14} /> Reject</Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState icon={<Store size={40} className="text-muted-foreground" />} title="No shops found" description="Try adjusting your search or filters." />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
