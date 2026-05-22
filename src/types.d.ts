import 'react'

declare module 'react' {
  interface HTMLAttributes<T> {
    placeholder?: string
    onPointerEnterCapture?: (e: any) => void
    onPointerLeaveCapture?: (e: any) => void
  }
}
