import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, EmptyState, StatGroup, Stat, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, toast } from '@blinkdotnew/ui'
import { Users, Search, CheckCircle2, Clock, CreditCard, Ban } from 'lucide-react'
import { api } from '../../lib/api'

export default function AdminSellers() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const { data: sellers = [] } = useQuery({
    queryKey: ['admin-sellers'],
    queryFn: () => api.sellers.list(),
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.sellers.updateStatus(id, 'active'),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-sellers'] }); toast.success('Seller approved'); },
    onError: () => { toast.error('Failed to approve seller'); }
  })

  const blockMutation = useMutation({
    mutationFn: (id: string) => api.sellers.updateStatus(id, 'blocked'),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-sellers'] }); toast.success('Seller blocked'); },
    onError: () => { toast.error('Failed to block seller'); }
  })

  const retryBillingMutation = useMutation({
    mutationFn: (id: string) => api.payments.bill(id),
    onSuccess: () => { toast.success('Billing retry initiated'); },
    onError: () => { toast.error('Billing retry failed'); }
  })

  const filteredSellers = useMemo(() => {
    return sellers.filter((s: any) => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = filterStatus === 'all' ? true : s.status === filterStatus
      return matchesSearch && matchesStatus
    })
  }, [sellers, searchQuery, filterStatus])

  const activeCount = sellers.filter((s: any) => s.status === 'active').length
  const pendingCount = sellers.filter((s: any) => s.status === 'pending').length
  const blockedCount = sellers.filter((s: any) => s.status === 'blocked').length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge variant="outline" className="text-[10px] border-green-500 text-green-500">Active</Badge>
      case 'pending': return <Badge variant="outline" className="text-[10px] border-amber-500 text-amber-500">Pending</Badge>
      case 'blocked': return <Badge variant="outline" className="text-[10px] border-red-500 text-red-500">Blocked</Badge>
      default: return null
    }
  }

  const getBillingBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge variant="secondary" className="text-[10px] bg-green-500/10 text-green-500 border-green-500/20">Billing Active</Badge>
      case 'failed': return <Badge variant="secondary" className="text-[10px] bg-red-500/10 text-red-500 border-red-500/20">Payment Failed</Badge>
      case 'cancelled': return <Badge variant="secondary" className="text-[10px] bg-muted text-muted-foreground">No Billing</Badge>
      default: return null
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Seller Management</h1>
        <p className="text-muted-foreground mt-1">Manage B2B smartstore sellers and their billing status.</p>
      </div>

      <StatGroup className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat label="Active Sellers" value={activeCount.toString()} icon={<Users className="text-green-500" />} />
        <Stat label="Pending Approval" value={pendingCount.toString()} icon={<Clock className="text-amber-500" />} />
        <Stat label="Blocked" value={blockedCount.toString()} icon={<Ban className="text-red-500" />} />
      </StatGroup>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-lg">B2B Sellers</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search sellers..." className="pl-9 h-9 w-[200px]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[130px] h-9"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="blocked">Blocked</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSellers.length > 0 ? (
            <div className="space-y-3">
              {filteredSellers.map((seller: any) => (
                <div key={seller.id} className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-lg border border-border bg-card">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1"><h3 className="font-bold text-sm">{seller.name}</h3>{getStatusBadge(seller.status)}</div>
                    <div className="text-xs text-muted-foreground mb-1">{seller.email}</div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground"><span>{seller.storeUrl}</span><span>·</span><span>Joined {new Date(seller.joinedAt).toLocaleDateString()}</span></div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {getBillingBadge(seller.billingStatus)}
                    {seller.status === 'pending' && <Button size="sm" className="h-8 gap-1" onClick={() => approveMutation.mutate(seller.id)}><CheckCircle2 size={14} /> Approve</Button>}
                    {seller.billingStatus === 'failed' && <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => retryBillingMutation.mutate(seller.id)}><CreditCard size={14} /> Retry Billing</Button>}
                    {seller.status === 'active' && <Button size="sm" variant="outline" className="h-8 gap-1 text-destructive" onClick={() => blockMutation.mutate(seller.id)}><Ban size={14} /> Block</Button>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={<Users size={40} className="text-muted-foreground" />} title="No sellers found" description="Try adjusting your search or filters." />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
