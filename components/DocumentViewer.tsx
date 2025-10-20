'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeft, Menu, X } from 'lucide-react';
import Link from 'next/link';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface DocumentViewerProps {
  htmlContent: string;
  slug: string;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ htmlContent }) => {
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    // Parse the HTML and extract h1 and h2 elements
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    const headings = tempDiv.querySelectorAll('h1, h2');
    const tocItems: TocItem[] = [];

    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.substring(1));
      const text = heading.textContent || '';
      const id = heading.getAttribute('id') || `heading-${index}`;
      
      // Set ID if not present
      heading.setAttribute('id', id);
      
      tocItems.push({ id, text, level });
    });

    setToc(tocItems);

    // Inject the modified HTML with IDs
    if (contentRef.current) {
      contentRef.current.innerHTML = tempDiv.innerHTML;
      
      // Add class to code blocks for styling
      const codeBlocks = contentRef.current.querySelectorAll('pre');
      codeBlocks.forEach(block => {
        block.classList.add('code-block');
      });
    }
  }, [htmlContent]);

  useEffect(() => {
    if (!contentRef.current) return;

    const headings = contentRef.current.querySelectorAll('h1, h2');
    
    const updateActiveHeading = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // If we're near the bottom (within 100px), highlight the last heading
      if (scrollY + windowHeight >= documentHeight - 100) {
        const lastHeading = headings[headings.length - 1];
        if (lastHeading) {
          setActiveId(lastHeading.id);
          return;
        }
      }
      
      // Find the current heading based on scroll position
      let currentId = '';
      let closestDistance = Infinity;
      
      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        const distanceFromTop = Math.abs(rect.top);
        
        // Heading that's passed or visible in top half of screen
        if (rect.top <= windowHeight * 0.5) {
          // Use the heading closest to the top that's already passed
          if (distanceFromTop < closestDistance) {
            currentId = heading.id;
            closestDistance = distanceFromTop;
          }
        }
      });
      
      if (currentId) {
        setActiveId(currentId);
      }
    };

    window.addEventListener('scroll', updateActiveHeading);
    updateActiveHeading(); // Initial call

    return () => window.removeEventListener('scroll', updateActiveHeading);
  }, [toc]);

  useEffect(() => {
    // Track scroll progress
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const trackLength = documentHeight - windowHeight;
      const progress = Math.min((scrollTop / trackLength) * 100, 100);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Handle copy button clicks - copy code to clipboard
    if (!contentRef.current) return;

    const handleCopyClick = async (e: Event) => {
      const target = e.target as HTMLElement;
      const copyBtn = target.closest('.copy-btn');
      
      if (copyBtn) {
        e.preventDefault();
        e.stopPropagation();
        
        // Find the code block
        const pre = copyBtn.parentElement?.querySelector('pre') || copyBtn.closest('pre');
        if (pre) {
          const code = pre.textContent || '';
          
          try {
            await navigator.clipboard.writeText(code);
            
            // Visual feedback
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = '✓';
            setTimeout(() => {
              copyBtn.innerHTML = originalHTML;
            }, 1500);
          } catch (err) {
            console.error('Failed to copy:', err);
          }
        }
      }
    };

    const content = contentRef.current;
    content.addEventListener('click', handleCopyClick);

    return () => {
      content.removeEventListener('click', handleCopyClick);
    };
  }, []);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offsetTop = element.offsetTop - 100;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth',
      });
      setSidebarOpen(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-neutral-900 p-2 rounded-lg border border-neutral-800 hover:border-green-400 hover:text-green-400 transition-all duration-300"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Back Button */}
      <Link
        href="/competitive"
        className="fixed top-4 right-4 z-50 bg-neutral-900 p-2 rounded-lg border border-neutral-800 hover:border-green-400 hover:text-green-400 transition-all duration-300 flex items-center gap-2 text-sm"
      >
        <ChevronLeft size={20} />
        <span className="hidden sm:inline">Back</span>
      </Link>

      {/* Scroll Progress & Top Button */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-4">
        <button
          onClick={scrollToTop}
          className="relative bg-neutral-900 p-3 rounded-full hover:scale-110 transition-all duration-300 group focus:outline-none"
          aria-label="Scroll to top"
        >
          {/* Progress Circle */}
          <svg 
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 100 100"
          >
            {/* Define radioactive green gradient */}
            <defs>
              <linearGradient id="radioactiveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4ade80" stopOpacity="1" />
                <stop offset="50%" stopColor="#22d3ee" stopOpacity="1" />
                <stop offset="100%" stopColor="#86efac" stopOpacity="1" />
              </linearGradient>
            </defs>
            {/* Progress circle - only this, no background */}
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="url(#radioactiveGradient)"
              strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 46}`}
              strokeDashoffset={`${2 * Math.PI * 46 * (1 - scrollProgress / 100)}`}
              className="transition-all duration-150"
              strokeLinecap="round"
            />
          </svg>
          {/* Arrow Icon */}
          <svg 
            className="w-5 h-5 text-neutral-400 group-hover:text-green-400 transition-colors relative z-10" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      </div>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:block fixed left-0 top-0 h-screen w-72 bg-[#0a0a0a] border-r border-neutral-800 overflow-y-auto scrollbar-hide">
        <div className="p-6">
          <h3 className="text-sm font-bold uppercase text-neutral-400 mb-4 tracking-wide">
            Table of Contents
          </h3>
          <nav className="space-y-1">
            {toc.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToHeading(item.id)}
                className={`
                  block w-full text-left py-2 px-3 text-sm transition-all duration-300
                  ${item.level === 1 ? 'font-semibold' : 'pl-8'}
                  ${
                    activeId === item.id
                      ? 'text-green-400 border-l-2 border-green-500 pl-2'
                      : 'text-neutral-500 hover:text-green-400 border-l-2 border-transparent'
                  }
                `}
              >
                {item.text}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Sidebar - Mobile */}
      <aside
        className={`
          lg:hidden fixed left-0 top-0 h-screen w-72 bg-[#0a0a0a] border-r border-neutral-800 overflow-y-auto z-40 transition-transform duration-300 scrollbar-hide
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-6 pt-16">
          <h3 className="text-sm font-bold uppercase text-neutral-400 mb-4 tracking-wide">
            Table of Contents
          </h3>
          <nav className="space-y-1">
            {toc.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToHeading(item.id)}
                className={`
                  block w-full text-left py-2 px-3 text-sm transition-all duration-300
                  ${item.level === 1 ? 'font-semibold' : 'pl-8'}
                  ${
                    activeId === item.id
                      ? 'text-green-400 border-l-2 border-green-500 pl-2'
                      : 'text-neutral-500 hover:text-green-400 border-l-2 border-transparent'
                  }
                `}
              >
                {item.text}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen scrollbar-hide">
        <div className="max-w-4xl w-full mx-auto px-6 sm:px-12 py-20">
          <div
            ref={contentRef}
            className="document-content"
          />
        </div>
      </main>

      {/* Document Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Hide scrollbar but keep functionality */
        html, body {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
        }
        html::-webkit-scrollbar, body::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }

        /* Hide scrollbars on TOC sidebars */
        .scrollbar-hide {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }

        /* ONLY fix lists - restore bullet points and numbering */
        .document-content ul {
          list-style-type: disc !important;
          list-style-position: outside !important;
          margin: 1em 0 !important;
          padding-left: 2em !important;
        }

        .document-content ol {
          list-style-type: decimal !important;
          list-style-position: outside !important;
          margin: 1em 0 !important;
          padding-left: 2em !important;
        }

        .document-content ul ul {
          list-style-type: circle !important;
        }

        .document-content ul ul ul {
          list-style-type: square !important;
        }

        .document-content li {
          display: list-item !important;
        }

        /* Code block styling */
        .document-content pre.code-block {
          outline: none !important;
          cursor: text;
          overflow-x: auto !important;
        }
        
        .document-content pre.code-block:focus {
          outline: none !important;
        }
      ` }} />
    </div>
  );
};

export default DocumentViewer;

