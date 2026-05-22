import { useState, useRef, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from '@tanstack/react-router'
import { AppShell, AppShellSidebar, AppShellMain, MobileSidebarTrigger, SidebarItem, Button, Badge, Persona } from '@blinkdotnew/ui'
import { LayoutDashboard, Calendar, ClipboardList, Settings, LogOut, Car, Bell, BarChart3, X, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { format } from 'date-fns'
import { API_BASE } from '../lib/api'

export default function OwnerLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const bellRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return
    fetch(`${API_BASE}/notifications`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('tirelink_token')}` }
    }).then(r => r.json()).then(data => setNotifications(data)).catch(() => {})
  }, [user])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const unreadCount = notifications.filter((n: any) => !n.read).length

  const markAsRead = async (id: string) => {
    await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${localStorage.getItem('tirelink_token')}` }
    })
    setNotifications(notifications.map((n: any) => n.id === id ? { ...n, read: true } : n))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_confirmed': return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'booking_cancelled': return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'booking_updated': return <Info className="h-4 w-4 text-blue-500" />
      default: return <Bell className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <AppShell>
      <AppShellSidebar className="shrink-0">
        <div className="flex flex-col h-full w-[16rem] bg-card border-r border-border overflow-hidden">
          <div className="shrink-0 h-16 border-b border-border flex items-center px-6 gap-2 font-bold text-lg tracking-tighter">
            <div className="bg-primary text-primary-foreground p-1 rounded"><Car className="h-5 w-5" /></div>
            TireLink
            <Badge variant="secondary" className="text-[9px] uppercase font-bold tracking-widest px-1">Shop</Badge>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto px-2 py-4 space-y-1">
            <SidebarItem icon={<LayoutDashboard size={18} />} label="Dashboard" active={location.pathname === '/owner/dashboard'} onClick={() => navigate({ to: '/owner/dashboard' })} />
            <SidebarItem icon={<Calendar size={18} />} label="Schedule" active={location.pathname === '/owner/calendar'} onClick={() => navigate({ to: '/owner/calendar' })} />
            <SidebarItem icon={<ClipboardList size={18} />} label="Settlements" active={location.pathname === '/owner/settlements'} onClick={() => navigate({ to: '/owner/settlements' })} />
            <SidebarItem icon={<BarChart3 size={18} />} label="Analytics" active={location.pathname === '/owner/analytics'} onClick={() => navigate({ to: '/owner/analytics' })} />
            <SidebarItem icon={<Settings size={18} />} label="Shop Settings" active={location.pathname === '/owner/settings'} onClick={() => navigate({ to: '/owner/settings' })} />
          </div>
          <div className="shrink-0 border-t border-border p-4 bg-muted/30">
            <Persona name={user?.name || 'Shop Owner'} subtitle="Partner Admin" className="mb-4" />
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground" onClick={() => { logout(); navigate({ to: '/' }) }}>
              <LogOut size={16} /> Sign Out
            </Button>
          </div>
        </div>
      </AppShellSidebar>

      <AppShellMain className="bg-muted/30 min-h-screen">
        <header className="h-16 border-b border-border bg-background/50 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <MobileSidebarTrigger className="md:hidden" />
            <h2 className="font-semibold">Shop Management</h2>
          </div>
          <div className="flex items-center gap-3">
            <div ref={bellRef} className="relative">
              <Button variant="outline" size="icon" className="relative" onClick={() => setShowNotifications(!showNotifications)}>
                <Bell size={18} />
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </Button>
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-xl shadow-black/10 overflow-hidden z-50">
                  <div className="flex items-center justify-between p-3 border-b border-border">
                    <span className="font-semibold text-sm">Notifications</span>
                    <Badge variant="secondary" className="text-[10px]">{unreadCount} unread</Badge>
                  </div>
                  <div className="max-h-[360px] overflow-y-auto">
                    {notifications.length > 0 ? notifications.slice(0, 20).map((n: any) => (
                      <div key={n.id} className={`flex items-start gap-3 p-3 border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}>
                        <div className="mt-0.5 shrink-0">{getNotificationIcon(n.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{n.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px] text-muted-foreground">{n.createdAt ? format(new Date(n.createdAt), 'MMM d, h:mm a') : ''}</span>
                            {!n.read && <button className="text-[10px] text-primary hover:underline" onClick={() => markAsRead(n.id)}>Mark read</button>}
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="p-8 text-center text-muted-foreground text-sm">No notifications yet</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <Link to="/"><Button variant="ghost" size="sm">Back to Site</Button></Link>
          </div>
        </header>
        <div className="p-6"><Outlet /></div>
      </AppShellMain>
    </AppShell>
  )
}
