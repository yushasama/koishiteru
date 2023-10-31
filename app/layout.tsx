import type { Metadata } from 'next'
import React from 'react';
import './globals.css'


export const metadata:Metadata = {
  title: '恋してる',
  description: 'Built by Leon, an aspiring SWE from Orange County, California. Created using NextJS, TailwindCSS, & Vercel',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  return (
    <html lang="en" className='backdrop-filter backdrop-blur-2xl bg-yuushasama bg-no-repeat bg-cover bg-dusk'>
      <body>{children}</body>
    </html>
  )
}
