import type { Metadata } from 'next'
import { Bebas_Neue, Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { esES } from '@clerk/localizations'
import { ThemeProvider } from '@/components/theme-provider'
import { Navigation } from '@/components/navigation'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const bebasNeue = Bebas_Neue({
  variable: '--font-bebas-neue',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SK8 Tepeji — La comunidad skate de Tepeji del Río',
  description: 'Descubre spots, comparte trucos y conecta con la escena skate de Tepeji del Río, México.',
  keywords: ['skate', 'tepeji', 'spots', 'trucos', 'skateboarding', 'méxico'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider localization={esES}>
      <html
        lang="es-MX"
        className={`${bebasNeue.variable} ${inter.variable}`}
        suppressHydrationWarning
      >
        <body className="min-h-screen bg-background text-foreground antialiased">
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            storageKey="sk8-theme"
          >
            <Navigation />
            <main className="pb-20 pt-12 md:pb-0 md:pt-16 lg:pt-0 lg:pl-60">
              {children}
            </main>
            <Toaster richColors position="top-center" />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
