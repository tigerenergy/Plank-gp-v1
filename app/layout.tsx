import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: '짭렐로 - 칸반 보드',
  description: '트렐로 스타일의 칸반 보드 애플리케이션',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontFamily: 'var(--font-pretendard)',
            },
          }}
          richColors
          closeButton
        />
      </body>
    </html>
  )
}
