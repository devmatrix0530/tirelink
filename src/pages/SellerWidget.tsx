import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, toast } from '@blinkdotnew/ui'
import { Code, Copy, ExternalLink, Store, CheckCircle2, Eye, Smartphone } from 'lucide-react'
import { api } from '../lib/api'

export default function SellerWidget() {
  const [selectedShopId, setSelectedShopId] = useState<string>('')
  const [copied, setCopied] = useState(false)

  const { data: shops = [] } = useQuery({
    queryKey: ['shops'],
    queryFn: () => api.shops.list(),
  })

  const selectedShop = shops.find((s: any) => s.id === selectedShopId)

  const widgetUrl = useMemo(() => {
    if (!selectedShopId) return ''
    return `${window.location.origin}/widget/${selectedShopId}`
  }, [selectedShopId])

  const embedCode = useMemo(() => {
    if (!widgetUrl) return ''
    return `<iframe src="${widgetUrl}" width="100%" height="200" frameborder="0" style="border:none;overflow:hidden;" title="TireLink Partner Shop"></iframe>`
  }, [widgetUrl])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode)
      setCopied(true)
      toast.success('Embed code copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy code')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Widget Integration</h1>
        <p className="text-muted-foreground mt-1">Embed your shop widget on your SmartStore product page. Customers can find and book directly.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Store className="text-primary" size={18} /> Select Your Shop</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedShopId} onValueChange={setSelectedShopId}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Choose a shop to generate widget" /></SelectTrigger>
            <SelectContent>{shops.map((shop: any) => (<SelectItem key={shop.id} value={shop.id}>{shop.name}</SelectItem>))}</SelectContent>
          </Select>
          {selectedShop && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0"><Store size={18} /></div>
              <div className="flex-1 min-w-0"><div className="text-sm font-medium">{selectedShop.name}</div><div className="text-xs text-muted-foreground">{selectedShop.address}</div></div>
              <Badge variant="outline" className="text-[10px]">ID: {selectedShop.id}</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedShopId && (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg flex items-center gap-2"><Code className="text-primary" size={18} /> Embed Code</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8 gap-1" onClick={() => window.open(widgetUrl, '_blank')}><Eye size={14} /> Preview</Button>
                <Button size="sm" className="h-8 gap-1" onClick={handleCopy}>{copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}{copied ? 'Copied!' : 'Copy Code'}</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div><label className="text-xs font-bold text-muted-foreground mb-1 block">Widget URL</label><Input value={widgetUrl} readOnly className="text-sm font-mono" /></div>
              <div><label className="text-xs font-bold text-muted-foreground mb-1 block">iframe Embed Code</label><pre className="p-4 rounded-lg bg-muted border border-border overflow-x-auto text-xs font-mono">{embedCode}</pre></div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20"><Smartphone size={16} className="text-blue-500 shrink-0" /><p className="text-xs text-muted-foreground">Paste this code into your SmartStore product detail page HTML editor. The widget will display your shop info and allow customers to book tire installation directly.</p></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><ExternalLink className="text-primary" size={18} /> Widget Preview</CardTitle></CardHeader>
            <CardContent>
              <div className="border border-border rounded-lg overflow-hidden max-w-md mx-auto">
                <div className="bg-muted/20 px-3 py-2 border-b border-border flex items-center gap-2">
                  <div className="flex gap-1"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /><div className="w-2.5 h-2.5 rounded-full bg-yellow-500" /><div className="w-2.5 h-2.5 rounded-full bg-green-500" /></div>
                  <span className="text-[10px] text-muted-foreground font-mono">widget-preview</span>
                </div>
                <div className="bg-white p-4"><iframe src={widgetUrl} width="100%" height="180" style={{ border: 'none', overflow: 'hidden' }} title="Widget Preview" /></div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
