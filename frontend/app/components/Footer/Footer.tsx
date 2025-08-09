// @AI-HINT: Footer component with comprehensive navigation links, social media, and company information. Uses per-component theming and accessibility best practices.

'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { footerNavItems } from '@/app/config/navigation';
import { MegiLanceLogo } from '../MegiLanceLogo/MegiLanceLogo';
import { 
  FaTwitter, 
  FaLinkedin, 
  FaGithub, 
  FaDiscord,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { cn } from '@/lib/utils';
import commonStyles from './Footer.common.module.css';
import lightStyles from './Footer.light.module.css';
import darkStyles from './Footer.dark.module.css';

export interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const { theme } = useTheme();
  const currentYear = new Date().getFullYear();

  if (!theme) return null;
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  return (
    <footer className={cn(themeStyles.themeWrapper, commonStyles.footer, themeStyles.footer, className)} role="contentinfo">
      <div className={cn(commonStyles.container, themeStyles.container)}>
        {/* Main Footer Content */}
        <div className={cn(commonStyles.main, themeStyles.main)}>
          {/* Company Info */}
          <div className={cn(commonStyles.section, themeStyles.section, commonStyles.brand, themeStyles.brand)}>
            <Link href="/" className={cn(commonStyles.logoLink, themeStyles.logoLink)} aria-label="MegiLance Home">
              <MegiLanceLogo />
            </Link>
            <p className={cn(commonStyles.description, themeStyles.description)}>
              Empowering freelancers with AI-powered tools and secure USDC payments. 
              Connect with global clients and grow your freelance business.
            </p>
            <div className={cn(commonStyles.social, themeStyles.social)}>
              <a 
                href="https://twitter.com/megilance" 
                target="_blank" 
                rel="noopener noreferrer"
                className={cn(commonStyles.socialLink, themeStyles.socialLink)}
                aria-label="Follow us on Twitter"
              >
                <FaTwitter />
              </a>
              <a 
                href="https://linkedin.com/company/megilance" 
                target="_blank" 
                rel="noopener noreferrer"
                className={cn(commonStyles.socialLink, themeStyles.socialLink)}
                aria-label="Connect with us on LinkedIn"
              >
                <FaLinkedin />
              </a>
              <a 
                href="https://github.com/megilance" 
                target="_blank" 
                rel="noopener noreferrer"
                className={cn(commonStyles.socialLink, themeStyles.socialLink)}
                aria-label="View our GitHub"
              >
                <FaGithub />
              </a>
              <a 
                href="https://discord.gg/megilance" 
                target="_blank" 
                rel="noopener noreferrer"
                className={cn(commonStyles.socialLink, themeStyles.socialLink)}
                aria-label="Join our Discord community"
              >
                <FaDiscord />
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div className={cn(commonStyles.section, themeStyles.section)}>
            <h3 className={cn(commonStyles.sectionTitle, themeStyles.sectionTitle)}>Company</h3>
            <ul className={cn(commonStyles.links, themeStyles.links)}>
              {footerNavItems.company.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={cn(commonStyles.link, themeStyles.link)}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div className={cn(commonStyles.section, themeStyles.section)}>
            <h3 className={cn(commonStyles.sectionTitle, themeStyles.sectionTitle)}>Services</h3>
            <ul className={cn(commonStyles.links, themeStyles.links)}>
              {footerNavItems.services.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={cn(commonStyles.link, themeStyles.link)}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className={cn(commonStyles.section, themeStyles.section)}>
            <h3 className={cn(commonStyles.sectionTitle, themeStyles.sectionTitle)}>Support</h3>
            <ul className={cn(commonStyles.links, themeStyles.links)}>
              {footerNavItems.support.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={cn(commonStyles.link, themeStyles.link)}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className={cn(commonStyles.section, themeStyles.section)}>
            <h3 className={cn(commonStyles.sectionTitle, themeStyles.sectionTitle)}>Contact</h3>
            <div className={cn(commonStyles.contact, themeStyles.contact)}>
              <div className={cn(commonStyles.contactItem, themeStyles.contactItem)}>
                <FaEnvelope className={cn(commonStyles.contactIcon, themeStyles.contactIcon)} />
                <a href="mailto:hello@megilance.com" className={cn(commonStyles.contactLink, themeStyles.contactLink)}>
                  hello@megilance.com
                </a>
              </div>
              <div className={cn(commonStyles.contactItem, themeStyles.contactItem)}>
                <FaPhone className={cn(commonStyles.contactIcon, themeStyles.contactIcon)} />
                <a href="tel:+92-300-1234567" className={cn(commonStyles.contactLink, themeStyles.contactLink)}>
                  +92 300 1234567
                </a>
              </div>
              <div className={cn(commonStyles.contactItem, themeStyles.contactItem)}>
                <FaMapMarkerAlt className={cn(commonStyles.contactIcon, themeStyles.contactIcon)} />
                <span className={cn(commonStyles.contactText, themeStyles.contactText)}>
                  Karachi, Pakistan
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className={cn(commonStyles.bottom, themeStyles.bottom)}>
          <div className={cn(commonStyles.bottomLeft, themeStyles.bottomLeft)}>
            <p className={cn(commonStyles.copyright, themeStyles.copyright)}>
              © {currentYear} MegiLance. All rights reserved.
            </p>
          </div>
          <div className={cn(commonStyles.bottomRight, themeStyles.bottomRight)}>
            <ul className={cn(commonStyles.legalLinks, themeStyles.legalLinks)}>
              {footerNavItems.legal.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={cn(commonStyles.legalLink, themeStyles.legalLink)}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
