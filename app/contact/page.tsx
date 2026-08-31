import type { ReactElement } from 'react';
import Image from 'next/image';
import { ArrowRight, Github, Linkedin, type LucideIcon } from 'lucide-react';
import { ContactArtwork, type ContactKind } from '@/components/contact/ContactArtwork';
import styles from './contact.module.css';

interface ContactLink {
  kind: ContactKind;
  name: string;
  url: string;
  description: string;
  icon?: LucideIcon;
  external: boolean;
}

const CONTACT_LINKS: readonly ContactLink[] = [
  { kind: 'github', name: 'GitHub', url: 'https://github.com/yushasama', description: 'Code repositories & projects', icon: Github, external: true },
  { kind: 'linkedin', name: 'LinkedIn', url: 'https://linkedin.com/in/leontdo', description: 'Professional network', icon: Linkedin, external: true },
  { kind: 'email', name: 'Email', url: 'mailto:leontdo2004@gmail.com', description: 'Get in touch', external: true },
  { kind: 'resume', name: 'Resume', url: '/resume/Leon_Do_Resume_2026.pdf', description: 'Download CV', external: false },
];

export default function ContactPage(): ReactElement {
  return (
    <div className={styles.page}>
      <div className={styles.background} aria-hidden="true">
        <Image src="/wallpapers/singapore.jpg" alt="" fill priority quality={90} sizes="100vw" className={styles.backgroundImage} />
      </div>
      <div className={styles.shade} aria-hidden="true" />

      <main className={styles.main}>
        <div className={styles.content}>
          <h1 className={styles.heading}>Contact</h1>
          <div className={styles.cards}>
            {CONTACT_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <a key={link.kind} href={link.url} target={link.external ? '_blank' : undefined} rel={link.external ? 'noopener noreferrer' : undefined} className={styles.card} data-contact={link.kind}>
                  {Icon && <Icon size={22} strokeWidth={1.6} className={styles.brandIcon} aria-hidden="true" />}
                  <div className={styles.artwork} aria-hidden="true"><ContactArtwork kind={link.kind} /></div>
                  <div className={styles.label}>
                    <h2>{link.name}</h2>
                    <p>{link.description}</p>
                  </div>
                  <ArrowRight size={20} strokeWidth={1.5} className={styles.arrow} aria-hidden="true" />
                </a>
              );
            })}
          </div>
        </div>
      </main>

      <footer className={styles.footer}>© {new Date().getFullYear()} Leon Do ・ Contact</footer>
    </div>
  );
}
