import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Upcoming MMA Events',
  description: 'Never miss a fight night. Stay up to date with the cards. UFC, ONE, PFL, Bellator.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
