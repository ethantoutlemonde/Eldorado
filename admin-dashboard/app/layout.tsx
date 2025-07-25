import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Eldorado Admin Dashboard',
  description: 'Dashboard for managing Eldorado users and content',
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
      <body>{children}</body>
    </html>
  )
}
