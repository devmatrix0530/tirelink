import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Badge, toast, Separator } from '@blinkdotnew/ui'
import { Store, Clock, Car, Save, Image, MapPin, Phone } from 'lucide-react'
import { api } from '../../lib/api'
import { useAuth } from '../../hooks/useAuth'

export default function OwnerSettings() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const { data: shop, isLoading } = useQuery({
    queryKey: ['my-shop', user?.id],
    queryFn: () => api.shops.list().then((shops: any) => shops.find((s: any) => s.userId === user?.id)),
    enabled: !!user,
  })

  const [form, setForm] = useState({
    name: '', address: '', latitude: 0, longitude: 0,
    liftCount: 2, openingHours: '', imageUrl: '', phone: '', description: ''
  })

  useEffect(() => {
    if (shop) {
      setForm({
        name: shop.name || '',
        address: shop.address || '',
        latitude: shop.latitude || 0,
        longitude: shop.longitude || 0,
        liftCount: shop.liftCount || 2,
        openingHours: shop.openingHours || '09:00 - 18:00',
        imageUrl: shop.imageUrl || '',
        phone: shop.phone || '',
        description: shop.description || '',
      })
    }
  }, [shop])

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.shops.update(shop.id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['my-shop'] }); toast.success('Shop updated') },
    onError: () => { toast.error('Failed to update shop') }
  })

  const [services, setServices] = useState<{ category: string; inch: number; price: number }[]>([])

  const { data: existingServices } = useQuery({
    queryKey: ['services', shop?.id],
    queryFn: () => api.services.getByShop(shop.id),
    enabled: !!shop,
  })

  useEffect(() => {
    if (existingServices && existingServices.length > 0) {
      setServices(existingServices.map((s: any) => ({ category: s.category, inch: s.inch, price: s.price })))
    }
  }, [existingServices])

  const serviceMutation = useMutation({
    mutationFn: () => api.services.bulkUpdate(shop.id, services),
    onSuccess: () => { toast.success('Pricing updated') },
    onError: () => { toast.error('Failed to update pricing') }
  })

  const addServiceRow = () => {
    setServices([...services, { category: 'domestic', inch: 15, price: 30000 }])
  }

  if (isLoading || !shop) return <div className="p-8 text-center text-muted-foreground">Loading shop settings...</div>

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-3xl font-bold tracking-tight text-foreground">Shop Settings</h1><p className="text-muted-foreground mt-1">Manage your shop profile and pricing information.</p></div>

      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Store className="text-primary" size={18} /> Basic Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-sm font-medium">Shop Name</label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Address</label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Latitude</label><Input type="number" value={form.latitude} onChange={e => setForm({ ...form, latitude: parseFloat(e.target.value) || 0 })} /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Longitude</label><Input type="number" value={form.longitude} onChange={e => setForm({ ...form, longitude: parseFloat(e.target.value) || 0 })} /></div>
            <div className="space-y-2"><label className="text-sm font-medium"><Clock className="h-3 w-3 inline" /> Opening Hours</label><Input value={form.openingHours} onChange={e => setForm({ ...form, openingHours: e.target.value })} placeholder="09:00 - 18:00" /></div>
            <div className="space-y-2"><label className="text-sm font-medium"><Car className="h-3 w-3 inline" /> Lift Count</label><Input type="number" value={form.liftCount} onChange={e => setForm({ ...form, liftCount: parseInt(e.target.value) || 2 })} /></div>
            <div className="space-y-2"><label className="text-sm font-medium"><Phone className="h-3 w-3 inline" /> Phone</label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="02-0000-0000" /></div>
            <div className="space-y-2"><label className="text-sm font-medium"><Image className="h-3 w-3 inline" /> Image URL</label><Input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." /></div>
          </div>
          <div className="space-y-2"><label className="text-sm font-medium">Description</label><textarea className="w-full h-24 rounded-lg border border-border bg-background p-3 text-sm" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <Button onClick={() => updateMutation.mutate(form)} disabled={updateMutation.isPending}><Save className="h-4 w-4 mr-2" /> Save Changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2">Pricing Table</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-secondary/50"><tr><th className="p-3 text-sm font-semibold">Category</th><th className="p-3 text-sm font-semibold">Inch</th><th className="p-3 text-sm font-semibold">Price (₩)</th><th className="p-3"></th></tr></thead>
              <tbody className="divide-y divide-border">
                {services.map((svc, i) => (
                  <tr key={i}>
                    <td className="p-2">
                      <select className="h-10 rounded-lg border border-border bg-background px-3 text-sm" value={svc.category} onChange={e => { const s = [...services]; s[i].category = e.target.value; setServices(s) }}>
                        <option value="domestic">Domestic</option><option value="import">Import</option>
                      </select>
                    </td>
                    <td className="p-2"><Input type="number" className="h-10 w-20" value={svc.inch} onChange={e => { const s = [...services]; s[i].inch = parseInt(e.target.value) || 0; setServices(s) }} /></td>
                    <td className="p-2"><Input type="number" className="h-10 w-28" value={svc.price} onChange={e => { const s = [...services]; s[i].price = parseInt(e.target.value) || 0; setServices(s) }} /></td>
                    <td className="p-2"><Button variant="ghost" size="sm" className="text-destructive" onClick={() => setServices(services.filter((_, j) => j !== i))}>Remove</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={addServiceRow}>Add Row</Button>
            <Button onClick={() => serviceMutation.mutate()} disabled={serviceMutation.isPending}><Save className="h-4 w-4 mr-2" /> Save Pricing</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
