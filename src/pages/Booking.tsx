import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Car, Phone, Calendar as CalendarIcon, CheckCircle2, ChevronRight, ChevronLeft, Clock, ShieldCheck, AlertCircle, MessageSquare } from 'lucide-react';
import { Button, Container, Card, CardContent, Input, Badge, Skeleton, toast, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Separator } from '@blinkdotnew/ui';
import { api } from '../lib/api';
import { format, addDays } from 'date-fns';

export default function BookingPage() {
  const { id } = useParams({} as any);
  const navigate = useNavigate();
  const [step, setStep] = React.useState(1);

  const [formData, setFormData] = React.useState({
    vehicleNumber: '',
    category: 'domestic' as 'domestic' | 'import',
    inch: '',
    phoneNumber: '',
    verificationCode: '',
    bookingDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    bookingTime: '09:00'
  });

  const [isVerifying, setIsVerifying] = React.useState(false);
  const [isVerified, setIsVerified] = React.useState(false);
  const [codeSent, setCodeSent] = React.useState(false);
  const [resendTimer, setResendTimer] = React.useState(0);
  const resendTimerRef = React.useRef<ReturnType<typeof setInterval>>(undefined);
  const [actualCode, setActualCode] = React.useState<string>('');

  const { data: shop, isLoading: isShopLoading } = useQuery({
    queryKey: ['shop', id],
    queryFn: () => api.shops.get(id),
  });

  const { data: services = [], isLoading: isServicesLoading } = useQuery({
    queryKey: ['services', id],
    queryFn: () => api.services.getByShop(id),
  });

  const availableInches = React.useMemo(() => {
    return Array.from(new Set(services.filter((s: any) => s.category === formData.category).map((s: any) => s.inch))).sort((a: any, b: any) => a - b);
  }, [services, formData.category]);

  const createBooking = useMutation({
    mutationFn: async (bookingData: any) => {
      return await api.bookings.create(bookingData);
    },
    onSuccess: () => {
      toast.success('Booking successful!');
      setStep(4);
    },
    onError: (error) => {
      toast.error('Booking failed. Please try again.');
      console.error(error);
    }
  });

  const handleNext = () => {
    if (step === 1) {
      const cleaned = formData.vehicleNumber.replace(/[\s-]/g, '');
      if (!cleaned || !formData.inch) { toast.error('Please fill in all vehicle details.'); return; }
      setStep(2);
    } else if (step === 2) {
      if (!isVerified) { toast.error('Please verify your phone number first.'); return; }
      setStep(3);
    } else if (step === 3) {
      createBooking.mutate({
        shopId: id,
        vehicleNumber: formData.vehicleNumber,
        phoneNumber: formData.phoneNumber,
        category: formData.category,
        inch: parseInt(formData.inch),
        bookingDate: `${formData.bookingDate}T${formData.bookingTime}:00`,
      });
    }
  };

  const handleBack = () => { if (step > 1) setStep(step - 1); };

  const handleSendCode = async () => {
    const cleaned = formData.phoneNumber.replace(/[^0-9]/g, '');
    if (cleaned.length < 10 || cleaned.length > 11) { toast.error('Enter a valid phone number (10-11 digits).'); return; }

    setIsVerifying(true);
    try {
      const result = await api.phone.sendCode(formData.phoneNumber);
      setActualCode(result.code || '');
      setCodeSent(true);
      setResendTimer(60);
      const interval = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) { clearInterval(interval); return 0; }
          return prev - 1;
        });
      }, 1000);
      resendTimerRef.current = interval;
      toast.success('Verification code sent to your phone.');
    } catch {
      toast.error('Failed to send verification code.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyCode = async () => {
    if (formData.verificationCode.length !== 6) { toast.error('Enter the 6-digit verification code.'); return; }
    try {
      await api.phone.verify(formData.phoneNumber, formData.verificationCode);
      setIsVerified(true);
      toast.success('Phone number verified!');
    } catch {
      toast.error('Invalid verification code.');
    }
  };

  React.useEffect(() => {
    return () => { if (resendTimerRef.current) clearInterval(resendTimerRef.current); };
  }, []);

  if (isShopLoading) return <Container className="py-20"><Skeleton className="h-[600px] w-full" /></Container>;
  if (!shop) return <Container className="py-20 text-center">Shop not found</Container>;

  const steps = [
    { title: 'Vehicle Info', icon: <Car className="h-4 w-4" /> },
    { title: 'Verification', icon: <Phone className="h-4 w-4" /> },
    { title: 'Schedule', icon: <CalendarIcon className="h-4 w-4" /> },
    { title: 'Done', icon: <CheckCircle2 className="h-4 w-4" /> }
  ];

  const selectedService = services.find((s: any) => s.category === formData.category && s.inch === parseInt(formData.inch));

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border py-4">
        <Container className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate({ to: `/shop/${id}` })}><ChevronLeft className="h-5 w-5" /></Button>
            <div><h1 className="font-bold">Booking Appointment</h1><p className="text-xs text-muted-foreground">{shop.name}</p></div>
          </div>
          <Badge variant="outline" className="hidden sm:flex border-primary/30 text-primary">High-Precision Service</Badge>
        </Container>
      </div>

      <Container className="py-12 max-w-4xl">
        <div className="mb-12">
          <div className="flex justify-between items-center max-w-2xl mx-auto relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-secondary -translate-y-1/2 z-0" />
            <div className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-500" style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }} />
            {steps.map((s, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center gap-2">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${step > i + 1 ? 'bg-primary border-primary text-primary-foreground' : step === i + 1 ? 'bg-background border-primary text-primary scale-110 shadow-lg shadow-primary/20' : 'bg-secondary border-secondary text-muted-foreground'}`}>
                  {step > i + 1 ? <CheckCircle2 className="h-5 w-5" /> : s.icon}
                </div>
                <span className={`text-[10px] uppercase tracking-widest font-bold hidden sm:block ${step === i + 1 ? 'text-primary' : 'text-muted-foreground'}`}>{s.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="border-border shadow-xl">
              <CardContent className="p-8">
                {step === 1 && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="space-y-2"><h2 className="text-2xl font-bold">Vehicle Details</h2><p className="text-sm text-muted-foreground">Select your vehicle category and wheel size for precise pricing.</p></div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Vehicle Number</label>
                        <Input placeholder="e.g. ABC-1234" className="h-12 text-lg uppercase font-mono" value={formData.vehicleNumber} onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Category</label>
                          <Select value={formData.category} onValueChange={(val: any) => setFormData({ ...formData, category: val, inch: '' })}>
                            <SelectTrigger className="h-12"><SelectValue placeholder="Category" /></SelectTrigger>
                            <SelectContent><SelectItem value="domestic">Domestic</SelectItem><SelectItem value="import">Import</SelectItem></SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Wheel Size (Inch)</label>
                          <Select value={formData.inch} onValueChange={(val) => setFormData({ ...formData, inch: val })}>
                            <SelectTrigger className="h-12"><SelectValue placeholder="Size" /></SelectTrigger>
                            <SelectContent>{availableInches.map((inch: number) => (<SelectItem key={inch} value={inch.toString()}>{inch} inch</SelectItem>))}</SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="space-y-2"><h2 className="text-2xl font-bold">Identity Verification</h2><p className="text-sm text-muted-foreground">We'll send a one-time code to your phone for verification.</p></div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Phone Number</label>
                        <div className="flex gap-2">
                          <Input type="tel" placeholder="010-0000-0000" className="h-12 text-lg flex-1" value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} disabled={isVerified || codeSent} />
                          {!isVerified && !codeSent && <Button className="h-12 px-6" onClick={handleSendCode} disabled={isVerifying}>{isVerifying ? 'Sending...' : 'Send Code'}</Button>}
                          {isVerified && <Badge variant="secondary" className="h-12 px-4 bg-primary/10 text-primary border-primary/20"><ShieldCheck className="h-5 w-5 mr-2" /> Verified</Badge>}
                        </div>
                      </div>
                      {codeSent && !isVerified && (
                        <div className="space-y-3 animate-fade-in">
                          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20"><MessageSquare size={16} className="text-primary shrink-0" /><p className="text-xs text-muted-foreground">A 6-digit code has been sent to {formData.phoneNumber}</p></div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Verification Code</label>
                            <div className="flex gap-2">
                              <Input placeholder="000000" className="h-12 text-lg text-center tracking-[0.5em] font-mono flex-1" maxLength={6} value={formData.verificationCode} onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value.replace(/[^0-9]/g, '').slice(0, 6) })} />
                              <Button className="h-12 px-6" onClick={handleVerifyCode} disabled={formData.verificationCode.length !== 6}>Verify</Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            {resendTimer > 0 ? <span className="text-xs text-muted-foreground">Resend code in {resendTimer}s</span> : <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={handleSendCode}>Resend code</Button>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="space-y-2"><h2 className="text-2xl font-bold">Select Date & Time</h2><p className="text-sm text-muted-foreground">Choose a convenient slot for your service.</p></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Service Date</label>
                        <Input type="date" className="h-12" min={format(addDays(new Date(), 1), 'yyyy-MM-dd')} value={formData.bookingDate} onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Service Time</label>
                        <Select value={formData.bookingTime} onValueChange={(val) => setFormData({ ...formData, bookingTime: val })}>
                          <SelectTrigger className="h-12"><SelectValue placeholder="Time" /></SelectTrigger>
                          <SelectContent>{['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(time => (<SelectItem key={time} value={time}>{time}</SelectItem>))}</SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="p-4 bg-secondary/50 rounded-lg border border-border flex gap-3"><AlertCircle className="h-5 w-5 text-primary shrink-0" /><p className="text-xs text-muted-foreground">Please arrive 10 minutes before your scheduled time. Service duration is approximately 45-60 minutes depending on vehicle type.</p></div>
                  </div>
                )}

                {step === 4 && (
                  <div className="text-center py-12 space-y-6 animate-fade-in">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6"><CheckCircle2 className="h-12 w-12 text-primary" /></div>
                    <div className="space-y-2"><h2 className="text-3xl font-bold">Booking Confirmed!</h2><p className="text-muted-foreground">Your appointment at {shop.name} has been successfully scheduled.</p></div>
                    <Card className="bg-secondary/30 border-dashed max-w-sm mx-auto">
                      <CardContent className="p-6 text-left space-y-3">
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Vehicle</span><span className="font-bold">{formData.vehicleNumber}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Date & Time</span><span className="font-bold">{formData.bookingDate} at {formData.bookingTime}</span></div>
                      </CardContent>
                    </Card>
                    <div className="flex gap-4 justify-center pt-6"><Button variant="outline" onClick={() => navigate({ to: '/' })}>Return Home</Button><Button onClick={() => navigate({ to: '/dashboard' })}>Manage Bookings</Button></div>
                  </div>
                )}

                {step < 4 && (
                  <div className="flex justify-between pt-10 mt-8 border-t border-border">
                    <Button variant="ghost" onClick={handleBack} disabled={step === 1}><ChevronLeft className="h-4 w-4 mr-2" /> Previous</Button>
                    <Button size="lg" className="px-10 h-12 text-lg font-bold" onClick={handleNext} disabled={createBooking.isPending}>
                      {createBooking.isPending ? 'Processing...' : step === 3 ? 'Confirm Booking' : 'Continue'}
                      {step < 3 && <ChevronRight className="h-4 w-4 ml-2" />}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {step < 4 && (
            <div className="space-y-6">
              <Card className="border-border bg-card/50 backdrop-blur-sm sticky top-32">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Booking Summary</h3>
                  <div className="space-y-4">
                    <div className="space-y-1"><p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Shop</p><p className="text-sm font-semibold">{shop.name}</p></div>
                    {formData.vehicleNumber && (<div className="space-y-1"><p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Vehicle</p><p className="text-sm font-semibold">{formData.vehicleNumber}</p></div>)}
                    {selectedService && (<div className="space-y-1"><p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Service</p><p className="text-sm font-semibold">{formData.category === 'domestic' ? 'Domestic' : 'Import'} - {formData.inch} inch</p></div>)}
                    {formData.bookingDate && (<div className="space-y-1"><p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Scheduled</p><p className="text-sm font-semibold">{formData.bookingDate} at {formData.bookingTime}</p></div>)}
                    <Separator className="my-4" />
                    <div className="flex justify-between items-center"><p className="text-sm font-bold">Estimated Total</p><p className="text-xl font-bold text-primary">{selectedService ? `₩${selectedService.price.toLocaleString()}` : '-'}</p></div>
                    <p className="text-[10px] text-muted-foreground text-center italic">Final price confirmed at shop. Taxes may apply.</p>
                  </div>
                </CardContent>
              </Card>
              <div className="flex items-center gap-3 p-4 border border-primary/20 bg-primary/5 rounded-xl"><Clock className="h-5 w-5 text-primary" /><p className="text-xs text-muted-foreground">Your reservation is held for 15 minutes. Complete the booking to secure this slot.</p></div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
