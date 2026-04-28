'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser, UserButton, SignInButton } from '@clerk/nextjs'
import { Home, MapPin, Plus, Trophy, Users, Zap } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/',          label: 'Inicio',    icon: Home },
  { href: '/spots',     label: 'Spots',     icon: MapPin },
  { href: '/rankings',  label: 'Rankings',  icon: Trophy },
  { href: '/skaters',   label: 'Skaters',   icon: Users },
]

export function Navigation() {
  const pathname = usePathname()
  const { isSignedIn } = useUser()

  return (
    <>
      {/* ── Desktop sidebar (≥1280px) ── */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-60 flex-col bg-card border-r border-border z-40">
        <div className="px-6 py-6">
          <Link href="/" className="flex items-center gap-2 group">
            <Zap size={22} className="text-primary" />
            <span className="font-heading text-2xl text-foreground tracking-wider">SK8 TEPEJI</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                pathname === href
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}

          {isSignedIn && (
            <Link
              href="/subir"
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mt-2',
                pathname === '/subir'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-primary/10 text-primary hover:bg-primary/20'
              )}
            >
              <Plus size={18} />
              Subir contenido
            </Link>
          )}
        </nav>

        <div className="px-4 py-5 border-t border-border flex items-center justify-between">
          <ThemeToggle />
          {isSignedIn ? (
            <UserButton  />
          ) : (
            <SignInButton mode="modal">
              <button className="text-sm text-primary font-medium hover:underline">
                Iniciar sesión
              </button>
            </SignInButton>
          )}
        </div>
      </aside>

      {/* ── Tablet top navbar (768px–1279px) ── */}
      <header className="hidden md:flex lg:hidden fixed top-0 left-0 right-0 h-16 bg-card/95 backdrop-blur-sm border-b border-border items-center px-4 z-40">
        <Link href="/" className="flex items-center gap-2 mr-6">
          <Zap size={20} className="text-primary" />
          <span className="font-heading text-xl tracking-wider">SK8 TEPEJI</span>
        </Link>

        <nav className="flex items-center gap-1 flex-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === href
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isSignedIn && (
            <Link href="/subir" className="btn-primary text-xs py-2 px-4">
              + Subir
            </Link>
          )}
          <ThemeToggle />
          {isSignedIn ? (
            <UserButton  />
          ) : (
            <SignInButton mode="modal">
              <button className="btn-ghost text-xs py-2 px-4">Entrar</button>
            </SignInButton>
          )}
        </div>
      </header>

      {/* ── Mobile top bar (<768px) ── */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-12 bg-card/95 backdrop-blur-sm border-b border-border flex items-center justify-between px-4 z-40">
        <Link href="/" className="flex items-center gap-1.5">
          <Zap size={16} className="text-primary" />
          <span className="font-heading text-lg tracking-wider">SK8 TEPEJI</span>
        </Link>
        <ThemeToggle />
      </header>

      {/* ── Mobile bottom navbar (<768px) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card/95 backdrop-blur-sm border-t border-border flex items-center justify-around px-2 z-40">
        {navItems.slice(0, 2).map(({ href, label, icon: Icon }) => (
          <MobileNavItem key={href} href={href} label={label} icon={Icon} active={pathname === href} />
        ))}

        {/* FAB central — Subir */}
        {isSignedIn ? (
          <Link
            href="/subir"
            className="flex flex-col items-center justify-center w-14 h-14 -mt-5 rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition-transform active:scale-95"
          >
            <Plus size={24} />
          </Link>
        ) : (
          <SignInButton mode="modal">
            <button className="flex flex-col items-center justify-center w-14 h-14 -mt-5 rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition-transform active:scale-95">
              <Plus size={24} />
            </button>
          </SignInButton>
        )}

        {navItems.slice(2).map(({ href, label, icon: Icon }) => (
          <MobileNavItem key={href} href={href} label={label} icon={Icon} active={pathname === href} />
        ))}

        {/* Perfil */}
        <div className="flex flex-col items-center gap-0.5">
          {isSignedIn ? (
            <UserButton  />
          ) : (
            <SignInButton mode="modal">
              <button className="flex flex-col items-center gap-0.5 text-muted-foreground">
                <Users size={22} />
                <span className="text-[10px]">Perfil</span>
              </button>
            </SignInButton>
          )}
        </div>
      </nav>
    </>
  )
}

function MobileNavItem({
  href, label, icon: Icon, active,
}: {
  href: string; label: string; icon: React.ElementType; active: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex flex-col items-center gap-0.5 px-2 py-1 transition-colors',
        active ? 'text-primary' : 'text-muted-foreground'
      )}
    >
      <Icon size={22} />
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  )
}
