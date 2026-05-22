const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('tirelink_token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new ApiError(res.status, body.error || 'Request failed')
  }

  return res.json()
}

export const api = {
  // Auth
  auth: {
    register: (data: { phoneNumber: string; password: string; name?: string; role?: string }) =>
      request<{ token: string; user: any }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: { phoneNumber: string; password: string }) =>
      request<{ token: string; user: any }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    phoneLogin: (phoneNumber: string) =>
      request<{ token: string; user: any }>('/auth/phone-login', { method: 'POST', body: JSON.stringify({ phoneNumber }) }),
    me: () => request<any>('/auth/me'),
    updateProfile: (data: { name?: string; email?: string }) =>
      request<any>('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
  },

  // Phone Verification
  phone: {
    sendCode: (phoneNumber: string) =>
      request<{ message: string; code?: string }>('/phone/send-code', { method: 'POST', body: JSON.stringify({ phoneNumber }) }),
    verify: (phoneNumber: string, code: string) =>
      request<{ message: string; phoneNumber: string }>('/phone/verify', { method: 'POST', body: JSON.stringify({ phoneNumber, code }) }),
  },

  // Shops
  shops: {
    list: (params?: { lat?: number; lng?: number; radius?: number }) => {
      const qs = new URLSearchParams()
      if (params?.lat) qs.set('lat', String(params.lat))
      if (params?.lng) qs.set('lng', String(params.lng))
      if (params?.radius) qs.set('radius', String(params.radius))
      const query = qs.toString()
      return request<any[]>(`/shops${query ? `?${query}` : ''}`)
    },
    listAll: () => request<any[]>('/shops/all'),
    get: (id: string) => request<any>(`/shops/${id}`),
    create: (data: any) => request<any>('/shops', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/shops/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    approve: (id: string) => request<any>(`/shops/${id}/approve`, { method: 'POST' }),
    delete: (id: string) => request<any>(`/shops/${id}`, { method: 'DELETE' }),
  },

  // Services
  services: {
    list: (shopId?: string) => {
      const qs = shopId ? `?shopId=${shopId}` : ''
      return request<any[]>(`/services${qs}`)
    },
    getByShop: (shopId: string) => request<any[]>(`/services/shop/${shopId}`),
    bulkUpdate: (shopId: string, services: any[]) =>
      request<any>('/services/bulk', { method: 'POST', body: JSON.stringify({ shopId, services }) }),
  },

  // Bookings
  bookings: {
    list: (params?: { phoneNumber?: string; shopId?: string; status?: string }) => {
      const qs = new URLSearchParams()
      if (params?.phoneNumber) qs.set('phoneNumber', params.phoneNumber)
      if (params?.shopId) qs.set('shopId', params.shopId)
      if (params?.status) qs.set('status', params.status)
      const query = qs.toString()
      return request<any[]>(`/bookings${query ? `?${query}` : ''}`)
    },
    get: (id: string) => request<any>(`/bookings/${id}`),
    create: (data: { shopId: string; vehicleNumber: string; phoneNumber: string; bookingDate: string; category?: string; inch?: number }) =>
      request<any>('/bookings', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id: string, status: string) =>
      request<any>(`/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    getByReference: (referenceId: string) => request<any>(`/bookings/reference/${referenceId}`),
  },

  // Sellers
  sellers: {
    list: () => request<any[]>('/sellers'),
    getMy: () => request<any>('/sellers/my'),
    create: (data: { name: string; email: string; storeUrl: string }) =>
      request<any>('/sellers', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id: string, status: string) =>
      request<any>(`/sellers/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    updateBilling: (id: string, billingStatus: string) =>
      request<any>(`/sellers/${id}/billing`, { method: 'PATCH', body: JSON.stringify({ billingStatus }) }),
    getByWidget: (code: string) => request<any>(`/sellers/widget/${code}`),
  },

  // Payments
  payments: {
    registerBillingKey: (billingKey: string, pgProvider?: string) =>
      request<any>('/payments/billing-key', { method: 'POST', body: JSON.stringify({ billingKey, pgProvider }) }),
    bill: (sellerId: string) =>
      request<any>('/payments/bill', { method: 'POST', body: JSON.stringify({ sellerId }) }),
    billAll: () => request<any>('/payments/bill-all', { method: 'POST' }),
  },
}
