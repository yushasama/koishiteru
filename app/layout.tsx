import type { Metadata } from 'next'
import './globals.css'

type CustomMetadata = Metadata & {
  image: string;
}

export const metadata: CustomMetadata = {
  title: '恋してる',
  description: 'Built by Leon, an aspiring SWE from Orange County, California. Created using NextJS, TailwindCSS, & Vercel',
  image: '/public/yuushasama.png',
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
