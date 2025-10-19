'use client'
import React, { createContext, useContext, useState, ReactNode } from 'react'

interface NavHighlightContextType {
  highlightedNav: string | null
  setHighlightedNav: (navItem: string | null) => void
}

const NavHighlightContext = createContext<NavHighlightContextType | undefined>(undefined)

export const useNavHighlight = () => {
  const context = useContext(NavHighlightContext)
  if (context === undefined) {
    throw new Error('useNavHighlight must be used within a NavHighlightProvider')
  }
  return context
}

interface NavHighlightProviderProps {
  children: ReactNode
}

export const NavHighlightProvider: React.FC<NavHighlightProviderProps> = ({ children }) => {
  const [highlightedNav, setHighlightedNav] = useState<string | null>(null)

  return (
    <NavHighlightContext.Provider value={{ highlightedNav, setHighlightedNav }}>
      {children}
    </NavHighlightContext.Provider>
  )
}
