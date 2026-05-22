import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Container, Card, CardContent, Button, Input, Badge, toast } from '@blinkdotnew/ui'
import { Car, Phone, Lock, User, ShieldCheck, MessageSquare } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { api } from '../lib/api'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [mode, setMode] = useState<'phone' | 'register'>('phone')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSendCode = async () => {
    const cleaned = phoneNumber.replace(/[^0-9]/g, '')
    if (cleaned.length < 10) { toast.error('Enter a valid phone number'); return }
    setLoading(true)
    try {
      await api.phone.sendCode(cleaned)
      setCodeSent(true)
      toast.success('Verification code sent')
    } catch { toast.error('Failed to send code') }
    finally { setLoading(false) }
  }

  const handleVerify = async () => {
    if (code.length !== 6) { toast.error('Enter the 6-digit code'); return }
    setLoading(true)
    try {
      await api.phone.verify(phoneNumber, code)
      const result = await api.auth.phoneLogin(phoneNumber)
      login(result.token, result.user)
      toast.success('Signed in successfully')
      navigate({ to: '/' })
    } catch { toast.error('Verification failed') }
    finally { setLoading(false) }
  }

  const handleRegister = async () => {
    const cleaned = phoneNumber.replace(/[^0-9]/g, '')
    if (cleaned.length < 10 || !password || !name) { toast.error('Please fill all fields'); return }
    setLoading(true)
    try {
      const result = await api.auth.register({ phoneNumber: cleaned, password, name, role: 'customer' })
      login(result.token, result.user)
      toast.success('Registered successfully')
      navigate({ to: '/' })
    } catch { toast.error('Registration failed') }
    finally { setLoading(false) }
  }

  return (
    <Container className="py-20 max-w-md">
      <Card className="border-border shadow-xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg inline-flex mb-4"><Car className="h-8 w-8" /></div>
            <h1 className="text-2xl font-bold">Welcome to TireLink</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {mode === 'phone' ? 'Sign in with your phone number' : 'Create a new account'}
            </p>
          </div>

          <div className="flex mb-6 bg-secondary rounded-lg p-1">
            <button onClick={() => setMode('phone')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'phone' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}><Phone className="h-4 w-4 inline mr-1" /> Phone</button>
            <button onClick={() => setMode('register')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'register' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}><User className="h-4 w-4 inline mr-1" /> Register</button>
          </div>

          {mode === 'phone' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <div className="flex gap-2">
                  <Input type="tel" placeholder="010-0000-0000" className="h-12 flex-1" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} disabled={codeSent} />
                  {!codeSent && <Button className="h-12" onClick={handleSendCode} disabled={loading}>{loading ? 'Sending...' : 'Send Code'}</Button>}
                </div>
              </div>
              {codeSent && (
                <div className="space-y-3 animate-fade-in">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20"><MessageSquare size={16} className="text-primary shrink-0" /><p className="text-xs text-muted-foreground">Code sent to {phoneNumber}</p></div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Verification Code</label>
                    <Input placeholder="000000" className="h-12 text-center tracking-[0.5em] font-mono" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} />
                  </div>
                  <Button className="w-full h-12" onClick={handleVerify} disabled={code.length !== 6 || loading}>{loading ? 'Verifying...' : 'Sign In'}</Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input placeholder="Your name" className="h-12" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <Input type="tel" placeholder="010-0000-0000" className="h-12" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input type="password" placeholder="At least 6 characters" className="h-12" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button className="w-full h-12" onClick={handleRegister} disabled={loading}>{loading ? 'Registering...' : 'Create Account'}</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </Container>
  )
}
