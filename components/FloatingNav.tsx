'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useNavHighlight } from '../contexts/NavHighlightContext'

  const FloatingNav = () => {
    const pathname = usePathname()
    const [isVisible, setIsVisible] = useState(true)
    const [lastScrollY, setLastScrollY] = useState(0)
    const [forceShow, setForceShow] = useState(false)
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

  // Show nav when highlighted
  useEffect(() => {
    if (highlightedNav) {
      setForceShow(true)
    } else {
      setForceShow(false)
    }
  }, [highlightedNav])

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

  return (
    <nav className={`main-site-nav fixed left-[50%] top-8 hidden md:flex w-fit -translate-x-[50%] items-center gap-6 rounded-lg border-[1px] border-neutral-700 bg-neutral-900/95 backdrop-blur-sm px-6 py-2 text-sm text-neutral-500 z-50 shadow-2xl transition-all duration-500 ease-out ${
      (isVisible || forceShow)
        ? 'translate-y-0 opacity-100' 
        : '-translate-y-20 opacity-0'
    }`}>
      {/* Logo SVG */}
      <img 
        src="/l.svg" 
        alt="Logo" 
        className="ml-2 w-6 h-6"
      />

      {/* Navigation Links */}
      {navItems.map((item) => {
        const isActive = pathname === item.href
        const isHighlighted = highlightedNav === item.label.toLowerCase()
        return (
          <Link 
            key={item.href}
            href={item.href} 
            rel="nofollow" 
            className={`block overflow-hidden transition-all duration-300 ${
              isActive 
                ? 'text-neutral-50' 
                : isHighlighted 
                  ? 'text-white nav-breathe' 
                  : 'text-neutral-500 hover:text-white nav-breathe-hover'
            }`}
          >
            <div className="h-[20px]" style={{ transform: isActive ? 'none' : undefined }}>
              <span className="flex h-[20px] items-center">{item.label}</span>
              <span className={`flex h-[20px] items-center ${isActive ? 'text-neutral-50' : ''}`}>
                {item.label}
              </span>
            </div>
          </Link>
        )
      })}
    </nav>
  )
}

export default FloatingNav
