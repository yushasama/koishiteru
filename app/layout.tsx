import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '恋してる',
  description: 'Built by Leon, an aspiring SWE from Orange County,California. Created using',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className='bg-yuushasama bg-no-repeat bg-cover'>
      <body>{children}</body>
    </html>
  )
}
