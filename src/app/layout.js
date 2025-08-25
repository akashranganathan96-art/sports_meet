import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

/** @type {import('next').Metadata} */
export const metadata = {
  title: '247 HealthMedPro Sports Meet 2025',
  description: 'Annual Sports Meet Voting and Management System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div id="root">{children}</div>
      </body>
    </html>
  )
}
