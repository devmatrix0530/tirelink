import { Link, Outlet, useNavigate } from '@tanstack/react-router'
import { Container, Button, Badge } from '@blinkdotnew/ui'
import { Car, Search, LayoutDashboard, User, LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function MainLayout() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter">
              <div className="bg-primary text-primary-foreground p-1 rounded"><Car className="h-6 w-6" /></div>
              TireLink
              <Badge variant="outline" className="ml-1 text-[10px] uppercase font-bold tracking-widest">O2O</Badge>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/find" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2"><Search className="h-4 w-4" /> Find Shops</Link>
              <Link to="/dashboard" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2"><LayoutDashboard className="h-4 w-4" /> My Bookings</Link>
              <Link to="/seller/widget" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2"><LayoutDashboard className="h-4 w-4" /> For Sellers</Link>
            </nav>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Link to="/dashboard"><Button variant="ghost" size="icon" className="rounded-full"><User className="h-5 w-5" /></Button></Link>
                  <Button variant="ghost" size="sm" onClick={() => { logout(); navigate({ to: '/' }) }}><LogOut className="h-4 w-4" /></Button>
                </div>
              ) : (
                <Link to="/login"><Button size="sm">Sign In</Button></Link>
              )}
            </div>
          </div>
        </Container>
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer className="border-t border-border bg-card py-12">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter mb-4"><div className="bg-primary text-primary-foreground p-1 rounded"><Car className="h-6 w-6" /></div>TireLink</Link>
              <p className="text-muted-foreground max-w-sm">The next-generation tire service platform connecting drivers with expert shops through seamless digital scheduling.</p>
            </div>
            <div><h4 className="font-bold mb-4">Platform</h4><ul className="space-y-2 text-sm text-muted-foreground"><li><Link to="/find">Find a Shop</Link></li><li><Link to="/dashboard">My Bookings</Link></li><li><Link to="/seller/widget">For Sellers</Link></li><li><Link to="/owner/dashboard">For Shop Owners</Link></li></ul></div>
            <div><h4 className="font-bold mb-4">Support</h4><ul className="space-y-2 text-sm text-muted-foreground"><li><a href="#">Help Center</a></li><li><a href="#">Terms of Service</a></li><li><a href="#">Privacy Policy</a></li></ul></div>
          </div>
          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">© {new Date().getFullYear()} TireLink. All rights reserved.</div>
        </Container>
      </footer>
    </div>
  )
}
