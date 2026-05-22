import { useState, useRef, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from '@tanstack/react-router'
import { Button, Badge } from '@blinkdotnew/ui'
import { Store, Users, LayoutDashboard, LogOut, Shield, Bell } from 'lucide-react'
import { cn } from '../lib/utils'
import { format } from 'date-fns'
import { API_BASE } from '../lib/api'

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Shops', path: '/admin/shops', icon: Store },
  { label: 'Sellers', path: '/admin/sellers', icon: Users },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const bellRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`${API_BASE}/notifications`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('tirelink_token')}` }
    }).then(r => r.json()).then(data => setNotifications(data)).catch(() => {})
  }, [])

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

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-card border-r border-border flex flex-col shrink-0">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Shield className="text-primary" size={20} />
            <span className="font-bold text-sm">TireLink Admin</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.path}
                onClick={() => navigate({ to: item.path })}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  location.pathname === item.path
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                )}
              >
                <Icon size={18} />
                {item.label}
              </button>
            )
          })}
        </nav>
        <div className="p-3 border-t border-border flex flex-col gap-2">
          <div ref={bellRef} className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
            >
              <Bell size={18} />
              Notifications
              {unreadCount > 0 && <Badge className="ml-auto text-[10px] h-5 min-w-5">{unreadCount}</Badge>}
            </button>
            {showNotifications && (
              <div className="absolute left-0 bottom-full mb-2 w-80 bg-card border border-border rounded-xl shadow-xl shadow-black/10 overflow-hidden z-50">
                <div className="flex items-center justify-between p-3 border-b border-border">
                  <span className="font-semibold text-sm">Notifications</span>
                  <Badge variant="secondary" className="text-[10px]">{unreadCount} unread</Badge>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.length > 0 ? notifications.slice(0, 20).map((n: any) => (
                    <div key={n.id} className={`p-3 border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}>
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                      <span className="text-[10px] text-muted-foreground mt-1 block">{n.createdAt ? format(new Date(n.createdAt), 'MMM d, h:mm a') : ''}</span>
                    </div>
                  )) : (
                    <div className="p-8 text-center text-muted-foreground text-sm">No notifications</div>
                  )}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => navigate({ to: '/' })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
          >
            <LogOut size={18} />
            Back to Site
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-6 bg-background">
        <Outlet />
      </main>
    </div>
  )
}
