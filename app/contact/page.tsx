'use client';

import React from 'react';
import { Github, Linkedin, Mail, FileText, ExternalLink, Download } from 'lucide-react';

const ContactPage = () => {
  const contactLinks = [
    {
      name: 'GitHub',
      url: 'https://github.com/yushasama',
      icon: Github,
      description: 'Code repositories & projects',
      color: 'from-gray-400 to-gray-600'
    },
    {
      name: 'LinkedIn',
      url: 'https://linkedin.com/in/leontdo',
      icon: Linkedin,
      description: 'Professional network',
      color: 'from-blue-400 to-blue-600'
    },
    {
      name: 'Email',
      url: 'mailto:leontdo2004@gmail.com',
      icon: Mail,
      description: 'Get in touch',
      color: 'from-red-400 to-red-600'
    },
    {
      name: 'Resume',
      url: '/resume/Leon_Do_SWE_Resume_2025.pdf',
      icon: FileText,
      description: 'Download CV',
      color: 'from-emerald-400 to-emerald-600'
    }
  ];

  return (
    <div className="pt-20 min-h-screen bg-singapore bg-no-repeat bg-cover bg-center bg-fixed relative flex flex-col">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md"></div>
      
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-5xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-8 text-center text-neutral-50">Contact</h1>
        </div>

        {/* Contact Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {contactLinks.map((link, index) => {
            const IconComponent = link.icon;
            return (
              <a
                key={link.name}
                href={link.url}
                target={link.name === 'Resume' ? '_self' : '_blank'}
                rel={link.name === 'Resume' ? '' : 'noopener noreferrer'}
                className="group relative bg-neutral-950/50 backdrop-blur-sm border border-neutral-800/50 rounded-2xl p-8 transition-all duration-500 hover:border-neutral-600/50 hover:bg-neutral-900/50 hover:scale-[1.02] hover:shadow-2xl hover:shadow-neutral-900/20"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                {/* Subtle glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-neutral-800/20 via-transparent to-neutral-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-neutral-800/50 group-hover:bg-neutral-700/50 transition-colors duration-300">
                      <IconComponent 
                        size={24} 
                        className="text-neutral-300 group-hover:text-white transition-colors duration-300" 
                      />
                    </div>
                     <div className="flex items-center gap-2">
                       <span className="text-xl font-light text-white group-hover:text-neutral-100 transition-colors duration-300">
                         {link.name}
                       </span>
                       {link.name === 'Resume' ? (
                         <Download 
                           size={16} 
                           className="text-neutral-500 group-hover:text-neutral-400 transition-colors duration-300" 
                         />
                       ) : (
                         <ExternalLink 
                           size={16} 
                           className="text-neutral-500 group-hover:text-neutral-400 transition-colors duration-300" 
                         />
                       )}
                     </div>
                  </div>
                  
                  <p className="text-neutral-400 text-sm font-light group-hover:text-neutral-300 transition-colors duration-300">
                    {link.description}
                  </p>
                </div>

                {/* Hover border effect */}
                <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-neutral-600/30 transition-all duration-500"></div>
              </a>
            );
          })}
        </div>

        </div>
      </div>
      
      <footer className="relative z-10 text-center text-sm text-gray-500 tracking-wide pb-8">
        © {new Date().getFullYear()} Leon Do ・ Contact
      </footer>
    </div>
  );
};

export default ContactPage;
