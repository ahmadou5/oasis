'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { WalletBalanceDisplay } from '@/components/WalletBalanceDisplay'
import { ThemeToggle } from './ThemeToggle'
import { Menu, X, Home, Users, Calculator, History } from 'lucide-react'
import clsx from 'clsx'

const navigationItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/validators', label: 'Validators', icon: Users },
  { href: '/calculator', label: 'Calculator', icon: Calculator },
  { href: '/staking', label: 'My Stakes', icon: History },
]

export function Navigation() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-white/80 dark:bg-solana-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-solana-gray-800/50 sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-solana-purple to-solana-green rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="font-bold text-xl gradient-text">Stakeit</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'nav-link flex items-center space-x-2',
                  pathname === href && 'nav-link-active'
                )}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* Wallet Balance & Wallet Button & Mobile Menu Toggle */}
          <div className="flex items-center space-x-4">
            {/* Wallet Balance - Hidden on small screens */}
            <div className="hidden lg:block">
              <WalletBalanceDisplay 
                size="sm" 
                showLabel={true} 
                showRefresh={true}
                variant="inline"
                className="min-w-[160px]"
              />
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />
            
            <WalletMultiButton className="!bg-gradient-to-r !from-solana-purple !to-solana-blue hover:!from-solana-purple/90 hover:!to-solana-blue/90 !rounded-lg !font-semibold !transition-all !duration-200 !shadow-lg hover:!shadow-xl" />
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-solana-gray-800 transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-solana-gray-800/50">
            <div className="space-y-4">
              {/* Mobile Wallet Balance */}
              <div className="lg:hidden">
                <WalletBalanceDisplay 
                  size="sm" 
                  showLabel={true}
                  showRefresh={true}
                  variant="card"
                />
              </div>
              
              {/* Navigation Links */}
              <div className="space-y-2">
                {navigationItems.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsMenuOpen(false)}
                    className={clsx(
                      'nav-link flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors',
                      pathname === href && 'nav-link-active bg-gray-100 dark:bg-solana-gray-800/50'
                    )}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}