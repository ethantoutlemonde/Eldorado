import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/auth-context'
import Background from '@/components/background'

export const metadata: Metadata = {
  title: 'ELDORADO',
  description: 'Blockchain Gambling Game',
  icons: {
    icon: '/favicon.png',
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Background>{children}</Background>
        </AuthProvider>
      </body>
    </html>
  )
}
