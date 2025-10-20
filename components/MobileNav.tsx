'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useNavHighlight } from '../contexts/NavHighlightContext'

const MobileNav = () => {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { highlightedNav } = useNavHighlight()

  useEffect(() => {
    // Don't add scroll listener on home page
    if (pathname === '/') {
      return
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Show navbar when near the top (within 100px of top)
      if (currentScrollY < 100) {
        setIsVisible(true)
      }
      // Hide navbar when scrolling down past 150px
      else if (currentScrollY > lastScrollY && currentScrollY > 150) {
        setIsVisible(false)
      }
      // Only show when scrolling up AND near the top
      else if (currentScrollY < lastScrollY && currentScrollY < 200) {
        setIsVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY, pathname])

  // Don't show navigation on home page
  if (pathname === '/') {
    return null
  }

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/competitive', label: 'Competitive' },
    { href: 'https://cache-me-if-you-can.up.railway.app/', label: 'Blog' },
    { href: '/research', label: 'Research' },
    { href: '/life', label: 'Life' },
    { href: '/contact', label: 'Contact' },
  ]

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <>
      {/* Mobile Navigation Bar */}
      <nav className={`fixed top-4 left-4 right-4 md:hidden rounded-lg border-[1px] border-neutral-700 bg-neutral-900/95 backdrop-blur-sm p-2 text-sm text-neutral-500 z-50 shadow-2xl transition-all duration-500 ease-out ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'
      }`}>
        <div className="flex items-center justify-between">
          {/* Logo */}
          <img 
            src="/l.svg" 
            alt="Logo" 
            className="ml-2 w-6 h-6"
          />
          
          {/* Menu Button */}
          <button
            onClick={toggleMenu}
            className="p-2 text-neutral-500 hover:text-neutral-300 transition-colors"
            aria-label="Toggle menu"
          >
            <svg 
              className={`w-5 h-5 transition-transform duration-300 ${isMenuOpen ? 'rotate-90' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`overflow-hidden transition-all duration-300 ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="mt-2 pt-2 border-t border-neutral-700">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const isHighlighted = highlightedNav === item.label.toLowerCase()
              return (
                <Link 
                  key={item.href}
                  href={item.href} 
                  rel="nofollow"
                  className={`block transition-all duration-300 px-2 py-1 ${
                    isActive 
                      ? 'text-white' 
                      : isHighlighted 
                        ? 'text-white nav-breathe' 
                        : 'text-neutral-500 hover:text-white nav-breathe-hover'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Backdrop */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  )
}

export default MobileNav
