import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import { Search, Star, MapPin, List, MapIcon, Crosshair, Navigation } from 'lucide-react';
import { Button, Input, Card, CardContent, Badge, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@blinkdotnew/ui';
import { api } from '../lib/api';
import { cn } from '../lib/utils';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow });

const userIcon = L.divIcon({
  className: 'user-location-marker',
  html: `<div style="width:24px;height:24px;background:#3b82f6;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

function UserMarker({ position }: { position: [number, number] }) {
  return <Marker position={position} icon={userIcon} />;
}

const RADIUS_OPTIONS = [
  { value: '5', label: '5 km' },
  { value: '10', label: '10 km' },
  { value: '20', label: '20 km' },
  { value: '50', label: '50 km' },
  { value: 'all', label: 'All Distance' },
];

export default function FindShop() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = React.useState<'list' | 'map'>('list');
  const [filterRating, setFilterRating] = React.useState<string>('all');
  const [filterLifts, setFilterLifts] = React.useState<string>('all');
  const [filterRadius, setFilterRadius] = React.useState<string>('10');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [userLocation, setUserLocation] = React.useState<[number, number] | null>(null);
  const [locationError, setLocationError] = React.useState<string | null>(null);
  const [locating, setLocating] = React.useState(false);

  const locateUser = React.useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('GPS not supported on this device');
      return;
    }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setUserLocation([pos.coords.latitude, pos.coords.longitude]); setLocating(false); },
      () => { setLocationError('Unable to get location. Please enable GPS.'); setLocating(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  React.useEffect(() => { locateUser() }, [locateUser]);

  const { data: shops = [], isLoading } = useQuery({
    queryKey: ['shops', userLocation?.[0], userLocation?.[1], filterRadius],
    queryFn: () => api.shops.list(
      userLocation ? { lat: userLocation[0], lng: userLocation[1], radius: parseInt(filterRadius) || 50 } : undefined
    ),
  });

  const filteredShops = React.useMemo(() => {
    return shops
      .map((shop: any) => ({
        ...shop,
        distance: userLocation ? haversineDistance(userLocation[0], userLocation[1], shop.latitude, shop.longitude) : null,
      }))
      .filter((shop: any) => {
        const matchesSearch = shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             shop.address.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRating = filterRating === 'all' ? true : shop.rating >= parseFloat(filterRating);
        const matchesLifts = filterLifts === 'all' ? true : shop.liftCount >= parseInt(filterLifts);
        return matchesSearch && matchesRating && matchesLifts;
      })
      .sort((a: any, b: any) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
  }, [shops, userLocation, searchQuery, filterRating, filterLifts]);

  const mapCenter: [number, number] = userLocation
    ? userLocation
    : filteredShops.length > 0
      ? [filteredShops[0].latitude, filteredShops[0].longitude]
      : [37.5665, 126.9780];

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="shrink-0 p-4 border-b border-border bg-card/50 backdrop-blur-md flex flex-wrap items-center gap-3 z-20">
        <Button variant={userLocation ? 'default' : 'outline'} size="sm" className="h-10 gap-2" onClick={locateUser} disabled={locating}>
          <Crosshair className={cn('h-4 w-4', locating && 'animate-spin')} />
          {locating ? 'Locating...' : 'Near Me'}
        </Button>
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by shop name or location..." className="pl-9 h-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={filterRadius} onValueChange={setFilterRadius}>
            <SelectTrigger className="w-[120px] h-10"><SelectValue placeholder="Radius" /></SelectTrigger>
            <SelectContent>{RADIUS_OPTIONS.map(o => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}</SelectContent>
          </Select>
          <Select value={filterRating} onValueChange={setFilterRating}>
            <SelectTrigger className="w-[120px] h-10"><SelectValue placeholder="Rating" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Ratings</SelectItem><SelectItem value="4">4+ Stars</SelectItem><SelectItem value="4.5">4.5+ Stars</SelectItem></SelectContent>
          </Select>
          <Select value={filterLifts} onValueChange={setFilterLifts}>
            <SelectTrigger className="w-[110px] h-10"><SelectValue placeholder="Lifts" /></SelectTrigger>
            <SelectContent><SelectItem value="all">Any Lifts</SelectItem><SelectItem value="2">2+ Lifts</SelectItem><SelectItem value="4">4+ Lifts</SelectItem></SelectContent>
          </Select>
          <div className="flex bg-secondary rounded-lg p-1">
            <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" className="h-8 px-3" onClick={() => setViewMode('list')}><List className="h-4 w-4 mr-1" /> List</Button>
            <Button variant={viewMode === 'map' ? 'default' : 'ghost'} size="sm" className="h-8 px-3" onClick={() => setViewMode('map')}><MapIcon className="h-4 w-4 mr-1" /> Map</Button>
          </div>
        </div>
        {locationError && <div className="w-full text-xs text-amber-500 flex items-center gap-1"><Navigation className="h-3 w-3" /> {locationError}</div>}
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className={cn('border-r border-border overflow-y-auto bg-background/50', viewMode === 'list' ? 'w-full' : 'hidden lg:block lg:w-[400px]')}>
          <div className="p-4 flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">{filteredShops.length} shops found{userLocation && ' · Sorted by distance'}</p>
            {isLoading ? Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="animate-pulse"><div className="h-48 bg-muted rounded-t-lg" /><CardContent className="p-4 space-y-3"><div className="h-4 bg-muted rounded w-3/4" /><div className="h-3 bg-muted rounded w-1/2" /><div className="h-8 bg-muted rounded w-full mt-4" /></CardContent></Card>
            )) : filteredShops.length === 0 ? (
              <div className="text-center py-20"><Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><h3 className="font-semibold text-lg">No shops found</h3><p className="text-sm text-muted-foreground">Try adjusting your filters or search query.</p><Button variant="link" onClick={() => { setSearchQuery(''); setFilterRating('all'); setFilterLifts('all'); setFilterRadius('10'); }}>Clear all filters</Button></div>
            ) : filteredShops.map((shop: any) => (
              <Card key={shop.id} className="overflow-hidden group hover:border-primary/50 transition-all cursor-pointer" onClick={() => navigate({ to: `/shop/${shop.id}` })}>
                <div className="relative h-48 overflow-hidden">
                  <img src={shop.imageUrl} alt={shop.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  <div className="absolute top-2 right-2"><Badge variant="secondary" className="bg-background/80 backdrop-blur-sm"><Star className="h-3 w-3 mr-1 fill-primary text-primary" /> {shop.rating}</Badge></div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-bold text-lg">{shop.name}</h3>
                    {shop.distance !== null && <Badge variant="outline" className="text-xs shrink-0 ml-2"><Navigation className="h-3 w-3 mr-1" />{shop.distance < 1 ? `${(shop.distance * 1000).toFixed(0)}m` : `${shop.distance.toFixed(1)}km`}</Badge>}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mb-3"><MapPin className="h-3 w-3 mr-1" /> {shop.address}</div>
                  <div className="flex items-center gap-4 mb-4"><Badge variant="outline" className="font-normal">{shop.liftCount} Lifts</Badge><span className="text-xs text-muted-foreground">{shop.openingHours}</span></div>
                  <Button className="w-full">View Details</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className={cn('flex-1 relative z-10', viewMode === 'list' ? 'hidden lg:block' : 'block w-full')}>
          <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <ChangeView center={mapCenter} zoom={userLocation ? 14 : 13} />
            {userLocation && <><UserMarker position={userLocation} /><Circle center={userLocation} radius={parseInt(filterRadius) * 1000 || 10000} pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.05, weight: 1, dashArray: '5, 5' }} /></>}
            {filteredShops.map((shop: any) => (
              <Marker key={shop.id} position={[shop.latitude, shop.longitude]}>
                <Popup>
                  <div className="p-1 min-w-[200px]">
                    <img src={shop.imageUrl} alt={shop.name} className="w-full h-24 object-cover rounded mb-2" />
                    <h4 className="font-bold text-sm mb-1">{shop.name}</h4>
                    <p className="text-xs text-muted-foreground mb-1">{shop.address}</p>
                    {shop.distance !== null && <p className="text-xs text-primary mb-2">{shop.distance < 1 ? `${(shop.distance * 1000).toFixed(0)}m away` : `${shop.distance.toFixed(1)}km away`}</p>}
                    <Button size="sm" className="w-full h-7 text-xs" onClick={() => navigate({ to: `/shop/${shop.id}` })}>Visit Shop</Button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
