'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeft, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { ScribbleRender } from 'scribble-render';
import 'scribble-render/dist/index.css';
import 'katex/dist/katex.min.css';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface DocumentViewerProps {
  markdownContent: string;
  slug: string;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ markdownContent }) => {
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tocCollapsed, setTocCollapsed] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isContentReady, setIsContentReady] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!markdownContent) return;

    // Extract headings from markdown for TOC
    const lines = markdownContent.split('\n');
    const tocItems: TocItem[] = [];
    let headingIndex = 0;

    lines.forEach((line) => {
      const h1Match = line.match(/^#\s+(.+)$/);
      const h2Match = line.match(/^##\s+(.+)$/);
      
      if (h1Match) {
        const text = h1Match[1];
        const id = `heading-${headingIndex++}`;
        tocItems.push({ id, text, level: 1 });
      } else if (h2Match) {
        const text = h2Match[1];
        const id = `heading-${headingIndex++}`;
        tocItems.push({ id, text, level: 2 });
      }
    });

    setToc(tocItems);
  }, [markdownContent]);

  useEffect(() => {
    // After ScribbleRender renders, add IDs to headings for TOC navigation
    if (!contentRef.current || toc.length === 0) return;

    setTimeout(() => {
      const headings = contentRef.current?.querySelectorAll('h1, h2');
      if (!headings) return;

      headings.forEach((heading, index) => {
        if (index < toc.length) {
          heading.setAttribute('id', toc[index].id);
        }
      });
    }, 100);
  }, [toc, markdownContent]);

  // Show loading state, then reveal content
  useEffect(() => {
    if (!markdownContent) return;
    
    setIsContentReady(false);
    
    // Wait longer for ScribbleRender to process
    const timer = setTimeout(() => {
      setIsContentReady(true);
    }, 600);

    return () => clearTimeout(timer);
  }, [markdownContent]);

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

  useEffect(() => {
    // Handle code block focus - add border and lock vertical scroll
    if (!contentRef.current) return;

    let activeCodeBlock: HTMLElement | null = null;

    const handleCodeBlockClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const codeBlock = (target.closest('.code-container') || target.closest('pre')) as HTMLElement;
      
      // Only activate on desktop
      if (codeBlock && window.innerWidth >= 1024) {
        // Find the actual scrollable element (pre or code-container)
        const scrollableElement = codeBlock.querySelector('pre') || codeBlock;
        
        // Check if there's capability to scroll horizontally
        const canScrollHorizontally = scrollableElement.scrollWidth > scrollableElement.clientWidth;
        
        // Remove active class from previous block
        if (activeCodeBlock && activeCodeBlock !== codeBlock) {
          activeCodeBlock.classList.remove('code-block-active');
          // Unlock scroll from previous block
          document.documentElement.style.overflow = '';
          document.body.style.overflow = '';
        }
        
        // Add active class to current block
        codeBlock.classList.add('code-block-active');
        activeCodeBlock = codeBlock;
        
        // Lock vertical scroll ONLY if horizontal scrolling is possible
        if (canScrollHorizontally) {
          document.documentElement.style.overflow = 'hidden';
          document.body.style.overflow = 'hidden';
        }
      }
    };

    const handleClickOutside = (e: Event) => {
      const target = e.target as HTMLElement;
      if (activeCodeBlock && !activeCodeBlock.contains(target)) {
        activeCodeBlock.classList.remove('code-block-active');
        activeCodeBlock = null;
        
        // Unlock vertical scroll
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
      }
    };

    const content = contentRef.current;
    content.addEventListener('click', handleCodeBlockClick, true);
    document.addEventListener('click', handleClickOutside, true);

    return () => {
      content.removeEventListener('click', handleCodeBlockClick, true);
      document.removeEventListener('click', handleClickOutside, true);
      // Clean up on unmount
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [markdownContent]);

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
      {/* Back Button - Desktop only */}
      <Link
        href="/competitive"
        className="hidden lg:flex fixed top-4 right-4 z-50 bg-neutral-900 p-2 rounded-lg border border-neutral-800 hover:border-green-400 hover:text-green-400 transition-all duration-300 items-center gap-2 text-sm"
      >
        <ChevronLeft size={20} />
        <span>Back</span>
      </Link>

      {/* Scroll Progress & Top Button - Desktop only */}
      <div className="hidden lg:flex fixed right-8 top-1/2 -translate-y-1/2 z-50 flex-col items-center gap-4">
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
      <aside className={`hidden lg:block fixed left-0 top-0 h-screen bg-[#0a0a0a] border-r border-neutral-800 overflow-y-auto scrollbar-hide transition-all duration-300 ${tocCollapsed ? 'w-12' : 'w-72'}`}>
        <div className="p-6">
          {/* Toggle Button */}
          <button
            onClick={() => setTocCollapsed(!tocCollapsed)}
            className="absolute top-4 right-3 p-1.5 rounded-lg border border-neutral-800 hover:border-green-400 hover:text-green-400 transition-all duration-300 z-50"
            aria-label={tocCollapsed ? 'Expand TOC' : 'Collapse TOC'}
          >
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${tocCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {!tocCollapsed && (
            <>
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
            </>
          )}
        </div>
      </aside>

      {/* Sidebar - Mobile */}
      <aside
        className={`
          lg:hidden fixed left-0 top-0 h-screen w-full sm:w-80 bg-[#0a0a0a] border-r border-neutral-800 overflow-y-auto z-40 transition-transform duration-300 scrollbar-hide
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

      {/* Mobile Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-neutral-900/95 backdrop-blur-sm border-t border-neutral-800">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Menu Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg border border-neutral-800 hover:border-green-400 hover:text-green-400 transition-all duration-300"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Back to Competitive */}
          <Link
            href="/competitive"
            className="p-2 rounded-lg border border-neutral-800 hover:border-green-400 hover:text-green-400 transition-all duration-300 flex items-center gap-2"
            aria-label="Back"
          >
            <ChevronLeft size={20} />
            <span className="text-sm">Back</span>
          </Link>

          {/* Scroll to Top with Progress */}
          <button
            onClick={scrollToTop}
            className="relative p-2 rounded-lg border border-neutral-800 hover:border-green-400 transition-all duration-300 focus:outline-none"
            aria-label="Scroll to top"
          >
            {/* Progress Circle */}
            <svg 
              className="absolute inset-0 w-full h-full -rotate-90"
              viewBox="0 0 100 100"
            >
              <defs>
                <linearGradient id="mobileRadioactiveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4ade80" stopOpacity="1" />
                  <stop offset="50%" stopColor="#22d3ee" stopOpacity="1" />
                  <stop offset="100%" stopColor="#86efac" stopOpacity="1" />
                </linearGradient>
              </defs>
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="url(#mobileRadioactiveGradient)"
                strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 46}`}
                strokeDashoffset={`${2 * Math.PI * 46 * (1 - scrollProgress / 100)}`}
                className="transition-all duration-150"
                strokeLinecap="round"
              />
            </svg>
            {/* Arrow Icon */}
            <svg 
              className="w-5 h-5 text-neutral-400 hover:text-green-400 transition-colors relative z-10" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className={`min-h-screen scrollbar-hide pb-24 lg:pb-0 transition-all duration-300 ${tocCollapsed ? 'lg:ml-12' : 'lg:ml-72'}`}>
        <div className="max-w-6xl w-full mx-auto px-6 sm:px-12 py-20">
          {/* Loading State */}
          {!isContentReady && (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-neutral-500 text-lg animate-pulse">
                Rendering document...
              </div>
            </div>
          )}
          
          {/* Content */}
          <div
            ref={contentRef}
            className={`document-content transition-opacity duration-300 ${
              isContentReady ? 'opacity-100' : 'opacity-0 absolute'
            }`}
          >
            <ScribbleRender
              content={markdownContent}
              theme="github-dark-high-contrast"
              codeTheme="material-theme-darker"
            />
          </div>
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

        /* Show scrollbars on code blocks */
        .document-content pre,
        .document-content pre.code-block,
        .document-content .shiki,
        .document-content .code-container {
          overflow: auto !important;
          overflow-x: auto !important;
          scrollbar-width: thin !important;
          scrollbar-color: #4ade80 rgba(23, 23, 23, 0.3) !important;
          unicode-bidi: normal !important;
          text-align: left !important;
          /* Ensure LTR for scrollbar positioning */
          -webkit-writing-mode: horizontal-tb !important;
          writing-mode: horizontal-tb !important;
          position: relative !important;
          transition: all 0.3s ease !important;
        }

        /* Electric blue border when code block is active - DESKTOP ONLY */
        @media (min-width: 1024px) {
          .document-content .code-container.code-block-active,
          .document-content pre.code-block-active {
            outline: 1px solid #60a5fa;
            outline-offset: 2px;
            transition: outline 0.3s ease;
          }
        }

        /* Hide scrollbar and copy button on mobile */
        @media (max-width: 1023px) {
          .document-content pre::-webkit-scrollbar,
          .document-content pre.code-block::-webkit-scrollbar,
          .document-content .shiki::-webkit-scrollbar,
          .document-content .code-container::-webkit-scrollbar {
            display: none !important;
          }

          .document-content pre,
          .document-content pre.code-block,
          .document-content .shiki,
          .document-content .code-container {
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
          }

          /* Hide copy button on mobile */
          .document-content .copy-btn,
          .document-content button[aria-label*="copy" i],
          .document-content button[aria-label*="clipboard" i] {
            display: none !important;
          }
        }
        
        .document-content pre code,
        .document-content .shiki code {
          direction: ltr !important;
          unicode-bidi: embed !important;
        }

        .document-content pre::-webkit-scrollbar,
        .document-content pre.code-block::-webkit-scrollbar,
        .document-content .shiki::-webkit-scrollbar {
          height: 10px !important;
          width: 10px !important;
          direction: ltr !important;
        }

        .document-content pre::-webkit-scrollbar-track,
        .document-content pre.code-block::-webkit-scrollbar-track,
        .document-content .shiki::-webkit-scrollbar-track {
          background: rgba(23, 23, 23, 0.3) !important;
          border-radius: 5px !important;
          direction: ltr !important;
        }

        .document-content pre::-webkit-scrollbar-thumb,
        .document-content pre.code-block::-webkit-scrollbar-thumb,
        .document-content .shiki::-webkit-scrollbar-thumb {
          background: #4ade80 !important;
          border-radius: 5px !important;
          border: 2px solid rgba(23, 23, 23, 0.3) !important;
          direction: ltr !important;
        }

        .document-content pre::-webkit-scrollbar-thumb:hover,
        .document-content pre.code-block::-webkit-scrollbar-thumb:hover,
        .document-content .shiki::-webkit-scrollbar-thumb:hover {
          background: #22d3ee !important;
        }
        
        /* Force scrollbar button direction */
        .document-content pre::-webkit-scrollbar-button,
        .document-content pre.code-block::-webkit-scrollbar-button,
        .document-content .shiki::-webkit-scrollbar-button {
          direction: ltr !important;
        }

      ` }} />
    </div>
  );
};

export default DocumentViewer;

