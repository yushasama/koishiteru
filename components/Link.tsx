import { ArrowUpRight } from "lucide-react";
import React from "react"
import { useNavHighlight } from "../contexts/NavHighlightContext"

interface LinkProps {
  text: string,
  link: string
  className?: string;
  highlightNav?: string; // Optional prop to specify which nav item to highlight
}

export const Link:React.FC<LinkProps> = ({text, link, className, highlightNav}) => {
  const { setHighlightedNav } = useNavHighlight()

  const handleMouseEnter = () => {
    if (highlightNav) {
      setHighlightedNav(highlightNav)
    }
  }

  const handleMouseLeave = () => {
    if (highlightNav) {
      setHighlightedNav(null)
    }
  }

  return(
    <a
    href={`${link}`}
    target="_blank"
    rel="noopener noreferrer"
    className={`inline-flex items-center transition-transform duration-200 hover:scale-[1.05] ${className}`}
    onMouseEnter={handleMouseEnter}
    onMouseLeave={handleMouseLeave}
    >{text}
    <ArrowUpRight
      className="inline-block align-[0.05em] h-[1em] w-[1em] opacity-70"
      strokeWidth={2}
    />
    </a>
  )
}

export const AwesomeLink:React.FC<LinkProps> = ({text, link, className}) => {
  return(
    <a
    href={`${link}`}
    target="_blank"
    rel="noopener noreferrer"
    className={
      `
      ${className}
      link-shine relative inline-flex items-center
      transition-transform duration-300 
      ease-[cubic-bezier(0.34,1.56,0.64,1)]
      hover:-translate-y-[3px] hover:scale-[1.07]
      hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]
      after:absolute after:bottom-0 after:left-1/2 after:h-[1px] after:w-[80%]
      after:-translate-x-1/2 after:bg-white after:opacity-0
      after:transition-opacity after:duration-200 hover:after:opacity-50
      `
    }
    >
    <span className="relative">{text}</span>
    <ArrowUpRight
      className="
        ml-1 inline-block align-[0.05em] h-[1em] w-[1em]
        opacity-70 transition-transform duration-300
        ease-[cubic-bezier(0.34,1.56,0.64,1)]
        group-hover:translate-x-[3px] group-hover:-translate-y-[2px]
      "
      strokeWidth={2}
    />
    </a>
  )
}