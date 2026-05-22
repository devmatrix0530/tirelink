export interface Shop {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  liftCount: number;
  openingHours: string;
  rating: number;
  imageUrl: string;
  userId?: string;
}

export interface Service {
  id: string;
  shopId: string;
  category: 'domestic' | 'import';
  inch: number;
  price: number;
}

export interface Booking {
  id: string;
  shopId: string;
  userId?: string;
  vehicleNumber: string;
  phoneNumber: string;
  bookingDate: string;
  status: 'pending' | 'received' | 'completed' | 'cancelled';
  createdAt: string;
}
