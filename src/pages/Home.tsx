import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Search, MapPin, Shield, Clock, TrendingUp } from 'lucide-react';
import { Button, Input, Container, Card, CardContent } from '@blinkdotnew/ui';

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: '/find', search: { q: searchQuery } as any });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/src/assets/hero.png" 
            alt="Hero Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>

        <Container className="relative z-10">
          <div className="max-w-2xl animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              Expert Tire Service, <br />
              <span className="text-primary">Precisely Linked.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-lg">
              Find and book professional tire shops in seconds. Transparent pricing, verified reviews, and seamless scheduling.
            </p>

            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 p-2 bg-card/50 backdrop-blur-md border border-border rounded-xl shadow-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Enter location or shop name..." 
                  className="pl-10 h-12 bg-transparent border-none focus-visible:ring-0 text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-8 text-lg font-semibold">
                Find Shop
              </Button>
            </form>
            
            <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" /> Verified Shops
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Instant Booking
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Best Prices
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-secondary/30">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose TireLink?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We've digitized the tire service experience to save you time and provide peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-card/50 border-border hover:border-primary/50 transition-colors">
              <CardContent className="pt-8">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Extensive Network</h3>
                <p className="text-muted-foreground">
                  Access hundreds of top-rated tire shops in your area with a single click.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border hover:border-primary/50 transition-colors">
              <CardContent className="pt-8">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Live Pricing</h3>
                <p className="text-muted-foreground">
                  No more hidden fees. Compare real-time prices for domestic and import vehicles.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border hover:border-primary/50 transition-colors">
              <CardContent className="pt-8">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">24/7 Booking</h3>
                <p className="text-muted-foreground">
                  Schedule your service anytime, anywhere. Receive instant confirmation and reminders.
                </p>
              </CardContent>
            </Card>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-border">
        <Container className="text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to upgrade your ride?</h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of drivers who trust TireLink for their automotive needs.
          </p>
          <Button size="lg" onClick={() => navigate({ to: '/find' })} className="px-10 h-14 text-lg">
            Find a Shop Near You
          </Button>
        </Container>
      </section>
    </div>
  );
}
