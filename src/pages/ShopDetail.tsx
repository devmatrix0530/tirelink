import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Star, MapPin, Clock, ChevronLeft, Info, CircleDollarSign, Car, CheckCircle2, MessageSquare, Send } from 'lucide-react';
import { Button, Container, Card, CardContent, Badge, Skeleton, Tabs, TabsList, TabsTrigger, TabsContent, Input, toast } from '@blinkdotnew/ui';
import { api, API_BASE } from '../lib/api';
import { format } from 'date-fns';

export default function ShopDetail() {
  const { id } = useParams({ from: '/shop/$id' as any });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  const { data: shop, isLoading: isShopLoading } = useQuery({
    queryKey: ['shop', id],
    queryFn: () => api.shops.get(id),
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services', id],
    queryFn: () => api.services.getByShop(id),
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => fetch(`${API_BASE}/reviews/shop/${id}`).then(r => r.json()),
  });

  const reviewMutation = useMutation({
    mutationFn: (data: any) => fetch(`${API_BASE}/reviews`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
    }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['reviews', id] }); queryClient.invalidateQueries({ queryKey: ['shop', id] }); toast.success('Review submitted!'); setReviewContent(''); },
    onError: () => { toast.error('Failed to submit review'); }
  });

  const handleSubmitReview = () => {
    if (!reviewAuthor || !reviewContent) { toast.error('Please fill in all fields'); return; }
    reviewMutation.mutate({ shopId: id, author: reviewAuthor, rating: reviewRating, content: reviewContent });
  };

  if (isShopLoading) return (<Container className="py-12"><Skeleton className="h-8 w-48 mb-6" /><div className="grid grid-cols-1 lg:grid-cols-3 gap-8"><div className="lg:col-span-2 space-y-6"><Skeleton className="h-[400px] w-full rounded-xl" /><Skeleton className="h-24 w-full" /><Skeleton className="h-64 w-full" /></div><div className="space-y-6"><Skeleton className="h-[300px] w-full rounded-xl" /></div></div></Container>);
  if (!shop) return (<Container className="py-20 text-center"><h2 className="text-2xl font-bold">Shop not found</h2><Button variant="link" onClick={() => navigate({ to: '/find' })}>Back to search</Button></Container>);

  const domesticServices = services.filter((s: any) => s.category === 'domestic').sort((a: any, b: any) => a.inch - b.inch);
  const importServices = services.filter((s: any) => s.category === 'import').sort((a: any, b: any) => a.inch - b.inch);
  const avgRating = reviews.length > 0 ? (reviews.reduce((s: any, r: any) => s + r.rating, 0) / reviews.length).toFixed(1) : shop.rating;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <section className="relative h-[400px]">
        <img src={shop.imageUrl} alt={shop.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <Container className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full">
          <Button variant="secondary" size="sm" className="mb-6 bg-background/50 backdrop-blur-md border-border" onClick={() => navigate({ to: '/find' })}><ChevronLeft className="h-4 w-4 mr-2" /> Back to Search</Button>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-primary text-primary-foreground border-none"><Star className="h-3 w-3 mr-1 fill-current" /> {avgRating}</Badge>
                <Badge variant="outline" className="border-primary/50 text-primary bg-primary/5">Professional Shop</Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{shop.name}</h1>
              <div className="flex items-center text-muted-foreground mt-3"><MapPin className="h-4 w-4 mr-2 text-primary" /> {shop.address}</div>
            </div>
            <Button size="lg" className="h-14 px-10 text-lg shadow-xl" onClick={() => navigate({ to: `/booking/${shop.id}` })}>Book an Appointment</Button>
          </div>
        </Container>
      </section>

      <Container className="py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-card border border-border rounded-xl p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Info className="h-5 w-5 text-primary" /> Shop Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Clock className="h-5 w-5 text-primary" /></div><div><p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Opening Hours</p><p className="font-medium">{shop.openingHours}</p></div></div>
                  <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Car className="h-5 w-5 text-primary" /></div><div><p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Facilities</p><p className="font-medium">{shop.liftCount} Lifting Stations</p></div></div>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">{shop.description || `Welcome to ${shop.name}. We provide high-quality tire services using the latest technology.`}</p>
                  <ul className="grid grid-cols-2 gap-2 mt-4">
                    <li className="flex items-center text-sm gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Premium Tires</li>
                    <li className="flex items-center text-sm gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Wheel Alignment</li>
                    <li className="flex items-center text-sm gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Nitrogen Fill</li>
                    <li className="flex items-center text-sm gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Brake Service</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-card border border-border rounded-xl p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><CircleDollarSign className="h-5 w-5 text-primary" /> Transparent Pricing</h2>
              <Tabs defaultValue="domestic" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 h-12">
                  <TabsTrigger value="domestic" className="text-base font-semibold">Domestic Vehicles</TabsTrigger>
                  <TabsTrigger value="import" className="text-base font-semibold">Import Vehicles</TabsTrigger>
                </TabsList>
                <TabsContent value="domestic"><div className="rounded-lg border border-border overflow-hidden"><table className="w-full text-left"><thead className="bg-secondary/50"><tr><th className="p-4 font-semibold text-sm">Wheel Size</th><th className="p-4 font-semibold text-sm text-right">Service Price</th></tr></thead><tbody className="divide-y divide-border">{domesticServices.length > 0 ? domesticServices.map((service: any) => (<tr key={service.id} className="hover:bg-secondary/20 transition-colors"><td className="p-4 font-medium">{service.inch} inch</td><td className="p-4 text-right font-bold text-primary">₩{service.price.toLocaleString()}</td></tr>)) : (<tr><td colSpan={2} className="p-8 text-center text-muted-foreground">No pricing data available</td></tr>)}</tbody></table></div></TabsContent>
                <TabsContent value="import"><div className="rounded-lg border border-border overflow-hidden"><table className="w-full text-left"><thead className="bg-secondary/50"><tr><th className="p-4 font-semibold text-sm">Wheel Size</th><th className="p-4 font-semibold text-sm text-right">Service Price</th></tr></thead><tbody className="divide-y divide-border">{importServices.length > 0 ? importServices.map((service: any) => (<tr key={service.id} className="hover:bg-secondary/20 transition-colors"><td className="p-4 font-medium">{service.inch} inch</td><td className="p-4 text-right font-bold text-primary">₩{service.price.toLocaleString()}</td></tr>)) : (<tr><td colSpan={2} className="p-8 text-center text-muted-foreground">No pricing data available</td></tr>)}</tbody></table></div></TabsContent>
              </Tabs>
              <p className="mt-6 text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg">* All prices are per tire. Standard balancing and valve stem replacement included.</p>
            </section>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-24 border-primary/20 shadow-lg shadow-primary/5">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Quick Booking</h3>
                <p className="text-sm text-muted-foreground mb-6">Ready to service your vehicle? Start your booking process now.</p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between py-2 border-b border-border"><span className="text-sm text-muted-foreground">Next Available</span><span className="text-sm font-semibold">Today, 2:00 PM</span></div>
                  <div className="flex items-center justify-between py-2 border-b border-border"><span className="text-sm text-muted-foreground">Service Duration</span><span className="text-sm font-semibold">~45 mins</span></div>
                </div>
                <Button className="w-full h-12 text-lg font-bold" onClick={() => navigate({ to: `/booking/${shop.id}` })}>Book Now</Button>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2"><MessageSquare className="h-4 w-4 text-primary" /> Reviews ({reviews.length})</h3>
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (<Star key={i} className={`h-5 w-5 ${i < Math.round(Number(avgRating)) ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />))}
                  <span className="ml-2 font-bold">{avgRating}</span>
                </div>
                <div className="space-y-4 max-h-[300px] overflow-y-auto">
                  {reviews.length > 0 ? reviews.map((review: any) => (
                    <div key={review.id} className="text-sm border-b border-border pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-1 mb-1">{Array.from({ length: review.rating }).map((_, i) => (<Star key={i} className="h-3 w-3 fill-primary text-primary" />))}</div>
                      <p className="mb-1 text-muted-foreground">"{review.content}"</p>
                      <p className="text-xs text-muted-foreground">— {review.author} · {format(new Date(review.createdAt), 'MMM d, yyyy')}</p>
                    </div>
                  )) : <p className="text-sm text-muted-foreground text-center py-4">No reviews yet. Be the first!</p>}
                </div>
                <div className="mt-4 pt-4 border-t border-border space-y-3">
                  <Input placeholder="Your name" value={reviewAuthor} onChange={e => setReviewAuthor(e.target.value)} className="h-9 text-sm" />
                  <div className="flex gap-1">{[1, 2, 3, 4, 5].map(i => (<button key={i} onClick={() => setReviewRating(i)}><Star className={`h-5 w-5 ${i <= reviewRating ? 'fill-primary text-primary' : 'text-muted-foreground'}`} /></button>))}</div>
                  <div className="flex gap-2">
                    <Input placeholder="Write a review..." value={reviewContent} onChange={e => setReviewContent(e.target.value)} className="h-9 text-sm flex-1" />
                    <Button size="sm" className="h-9" onClick={handleSubmitReview} disabled={reviewMutation.isPending}><Send className="h-3 w-3" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}
