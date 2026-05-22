import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
} from '@tanstack/react-router'
import Home from './pages/Home'
import Login from './pages/Login'
import FindShop from './pages/FindShop'
import ShopDetail from './pages/ShopDetail'
import Booking from './pages/Booking'
import MyDashboard from './pages/MyDashboard'
import OwnerDashboard from './pages/owner/OwnerDashboard'
import OwnerCalendar from './pages/owner/OwnerCalendar'
import OwnerSettlements from './pages/owner/OwnerSettlements'
import AdminLayout from './layouts/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminShops from './pages/admin/AdminShops'
import AdminSellers from './pages/admin/AdminSellers'
import SellerWidget from './pages/SellerWidget'
import MainLayout from './layouts/MainLayout'
import OwnerLayout from './layouts/OwnerLayout'
import OwnerAnalytics from './pages/owner/OwnerAnalytics'
import OwnerSettings from './pages/owner/OwnerSettings'
import Widget from './pages/Widget'

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
    </>
  ),
})

const mainLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'main',
  component: MainLayout,
})

const ownerLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'owner',
  component: OwnerLayout,
})

const indexRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: '/',
  component: Home,
})

const loginRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: '/login',
  component: Login,
})

const findShopRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: '/find',
  component: FindShop,
})

const shopDetailRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: '/shop/$id',
  component: ShopDetail,
})

const bookingRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: '/booking/$id',
  component: Booking,
})

const myDashboardRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: '/dashboard',
  component: MyDashboard,
})

const ownerDashboardRoute = createRoute({
  getParentRoute: () => ownerLayoutRoute,
  path: '/owner/dashboard',
  component: OwnerDashboard,
})

const ownerCalendarRoute = createRoute({
  getParentRoute: () => ownerLayoutRoute,
  path: '/owner/calendar',
  component: OwnerCalendar,
})

const ownerSettlementsRoute = createRoute({
  getParentRoute: () => ownerLayoutRoute,
  path: '/owner/settlements',
  component: OwnerSettlements,
})

const ownerAnalyticsRoute = createRoute({
  getParentRoute: () => ownerLayoutRoute,
  path: '/owner/analytics',
  component: OwnerAnalytics,
})

const ownerSettingsRoute = createRoute({
  getParentRoute: () => ownerLayoutRoute,
  path: '/owner/settings',
  component: OwnerSettings,
})

const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'admin',
  component: AdminLayout,
})

const adminDashboardRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/admin',
  component: AdminDashboard,
})

const adminShopsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/admin/shops',
  component: AdminShops,
})

const adminSellersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/admin/sellers',
  component: AdminSellers,
})

const widgetRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/widget/$shopId',
  component: Widget,
})

const sellerWidgetRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: '/seller/widget',
  component: SellerWidget,
})

const routeTree = rootRoute.addChildren([
  mainLayoutRoute.addChildren([
    indexRoute,
    loginRoute,
    findShopRoute,
    shopDetailRoute,
    bookingRoute,
    myDashboardRoute,
    sellerWidgetRoute,
  ]),
  ownerLayoutRoute.addChildren([
    ownerDashboardRoute,
    ownerCalendarRoute,
    ownerSettlementsRoute,
    ownerAnalyticsRoute,
    ownerSettingsRoute,
  ]),
  adminLayoutRoute.addChildren([
    adminDashboardRoute,
    adminShopsRoute,
    adminSellersRoute,
  ]),
  widgetRoute,
])

const router = createRouter({
  routeTree,
  basepath: import.meta.env.DEV ? '/' : '/tirelink/',
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default function App() {
  return <RouterProvider router={router} />
}
