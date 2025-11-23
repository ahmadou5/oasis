'use client'

import { useTheme } from '@/context/ThemeContext'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const [showOptions, setShowOptions] = useState(false)

  const themes = [
    { value: 'light' as const, icon: Sun, label: 'Light Mode' },
    { value: 'dark' as const, icon: Moon, label: 'Dark Mode' },
  ]

  const currentTheme = themes.find(t => t.value === theme) || themes[1]
  const CurrentIcon = currentTheme.icon

  return (
    <div className="relative">
      {/* Simple Toggle Button */}
      <button
        onClick={toggleTheme}
        className={clsx(
          'p-2 rounded-lg transition-all duration-300 hover:scale-110',
          'bg-gradient-to-r shadow-lg hover:shadow-xl',
          theme === 'dark' 
            ? 'from-yellow-400/20 to-orange-400/20 hover:from-yellow-400/30 hover:to-orange-400/30 text-yellow-400'
            : 'from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 text-purple-600'
        )}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        <div className="relative">
          <CurrentIcon 
            size={20} 
            className={clsx(
              'transition-all duration-300',
              theme === 'dark' ? 'rotate-0' : 'rotate-180'
            )} 
          />
          
          {/* Animated glow effect */}
          <div className={clsx(
            'absolute inset-0 rounded-full blur-md opacity-60 transition-all duration-300',
            theme === 'dark' 
              ? 'bg-yellow-400 animate-pulse' 
              : 'bg-purple-500 animate-pulse'
          )} />
        </div>
      </button>

      {/* Enhanced Toggle with Options (commented out - can be enabled) */}
      {/* 
      <div className="relative">
        <button
          onClick={() => setShowOptions(!showOptions)}
          className={clsx(
            'p-2 rounded-lg transition-all duration-200 hover:scale-105',
            'bg-white/10 dark:bg-black/10 backdrop-blur-sm',
            'border border-white/20 dark:border-black/20',
            'hover:bg-white/20 dark:hover:bg-black/20'
          )}
          title={currentTheme.label}
        >
          <CurrentIcon size={18} />
        </button>

        {showOptions && (
          <div className={clsx(
            'absolute top-full right-0 mt-2 py-1 min-w-[150px]',
            'bg-white dark:bg-gray-800 rounded-lg shadow-xl',
            'border border-gray-200 dark:border-gray-700',
            'animate-slide-up z-50'
          )}>
            {themes.map((themeOption) => {
              const Icon = themeOption.icon
              return (
                <button
                  key={themeOption.value}
                  onClick={() => {
                    setTheme(themeOption.value)
                    setShowOptions(false)
                  }}
                  className={clsx(
                    'w-full px-3 py-2 text-left flex items-center gap-2',
                    'hover:bg-gray-100 dark:hover:bg-gray-700',
                    'transition-colors text-sm',
                    theme === themeOption.value 
                      ? 'text-solana-purple font-medium' 
                      : 'text-gray-700 dark:text-gray-300'
                  )}
                >
                  <Icon size={16} />
                  {themeOption.label}
                </button>
              )
            })}
          </div>
        )}
      </div>
      */}
    </div>
  )
}