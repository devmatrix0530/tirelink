import { Component, ReactNode } from 'react'
import { Button, Container, Card, CardContent } from '@blinkdotnew/ui'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container className="py-20">
          <Card className="max-w-md mx-auto border-destructive/30">
            <CardContent className="p-8 text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold">Something went wrong</h1>
              <p className="text-muted-foreground text-sm">{this.state.error?.message || 'An unexpected error occurred'}</p>
              <div className="flex gap-3 justify-center pt-4">
                <Button variant="outline" onClick={() => window.location.href = '/'}><Home className="h-4 w-4 mr-2" /> Go Home</Button>
                <Button onClick={() => window.location.reload()}><RefreshCw className="h-4 w-4 mr-2" /> Reload</Button>
              </div>
            </CardContent>
          </Card>
        </Container>
      )
    }
    return this.props.children
  }
}
