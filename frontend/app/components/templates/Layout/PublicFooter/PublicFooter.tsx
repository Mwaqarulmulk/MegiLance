// @AI-HINT: Premium public footer with sitemap links, newsletter CTA, social icons, globe decoration, and gradient top border.
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useThemeStyles } from '@/app/hooks/useThemeMode';
import { cn } from '@/lib/utils';
import { Github, Twitter, Linkedin, Mail, ShieldCheck, Percent, BadgeCheck, Headphones } from 'lucide-react';

import { MegiLanceLogo } from '@/app/components/atoms/MegiLanceLogo/MegiLanceLogo';
import FooterGlobe from './FooterGlobe';
import ReportIssueButton from '@/app/components/ErrorReporting/ReportIssueButton';

import commonStyles from './PublicFooter.common.module.css';
import lightStyles from './PublicFooter.light.module.css';
import darkStyles from './PublicFooter.dark.module.css';

const footerSections = {
  'AI Tools': [
    { name: 'Website Cost Calculator', href: '/tools/website-cost-calculator' },
    { name: 'AI Startup Advisor', href: '/tools/ai-startup-advisor' },
    { name: 'AI Tools Hub (All 16)', href: '/tools' },
    { name: 'Price Estimator', href: '/ai/price-estimator' },
    { name: 'Proposal Writer', href: '/ai/proposal-writer' },
    { name: 'Rate Advisor', href: '/ai/rate-advisor' },
    { name: 'Scope Planner', href: '/ai/scope-planner' },
    { name: 'Risk & Scam Checker', href: '/ai/fraud-check' },
    { name: 'Skill Analyzer', href: '/ai/skill-analyzer' },
  ],
  'Hire Talent': [
    { name: 'React Developers', href: '/hire/react-developer' },
    { name: 'Python Developers', href: '/hire/python-developer' },
    { name: 'Full-Stack Developers', href: '/hire/fullstack-developer' },
    { name: 'UI/UX Designers', href: '/hire/ui-ux-designer' },
    { name: 'Cost to Hire Guide (2026)', href: '/cost-to-hire/react-developer' },
    { name: 'All 44+ Skills Directory', href: '/hire' },
  ],
  'Compare & Save': [
    { name: 'Upwork Fee Calculator', href: '/tools/upwork-fee-calculator' },
    { name: 'Fiverr Fee Calculator', href: '/tools/fiverr-fee-calculator' },
    { name: 'Upwork Alternative', href: '/compare/upwork' },
    { name: 'Fiverr Alternative', href: '/compare/fiverr' },
    { name: 'Toptal Alternative', href: '/compare/toptal' },
    { name: 'Freelancer.com Alternative', href: '/compare/freelancer-com' },
    { name: 'Best Freelancing Websites', href: '/freelancing-websites' },
    { name: 'Fee Comparison Matrix', href: '/compare' },
  ],
  'Trust & Safety': [
    { name: 'Trust Overview', href: '/trust' },
    { name: 'AI Methodology', href: '/methodology' },
    { name: 'Security & Escrow', href: '/security/escrow' },
    { name: 'Dispute Protection', href: '/trust' },
    { name: 'Support & Help', href: '/support' },
    { name: 'System Status', href: '/system-status' },
  ],
  'Company & Legal': [
    { name: 'About MegiLance', href: '/about' },
    { name: 'Blog & Playbooks', href: '/blog' },
    { name: 'Pricing & Zero Fee', href: '/pricing' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Cookie Policy', href: '/cookies' },
  ],
};

const socialLinks = [
  { name: 'GitHub', href: 'https://github.com/ghulam-mujtaba5/MegiLance', icon: Github },
  { name: 'Email Support', href: 'mailto:support@megilance.site', icon: Mail },
];

const PublicFooter = () => {
  const styles = useThemeStyles(lightStyles, darkStyles);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubscribed(true);
    }, 400);
  };

  return (
    <motion.footer initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }} className={cn(commonStyles.footer, styles.footer)}>
      <div className={commonStyles.topBorder} />
      <FooterGlobe />
      <div className={cn(commonStyles.container, styles.container)}>
        <div className={commonStyles.mainContent}>
          <div className={commonStyles.brandColumn}>
            <Link href="/" aria-label="MegiLance Home" className={commonStyles.brandLink}>
              <MegiLanceLogo />
            </Link>
            <p className={cn(commonStyles.tagline, styles.tagline)}>
              Free AI Freelance Tools &amp; Smart Marketplace
            </p>
            {/* Trust signals — reinforce safety & value */}
            <ul
              aria-label="Why MegiLance"
              style={{
                listStyle: 'none', padding: 0, margin: '0 0 1.25rem',
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1rem',
              }}
            >
              {[
                { icon: ShieldCheck, label: 'Milestone escrow' },
                { icon: Percent, label: 'Promotional pricing' },
                { icon: BadgeCheck, label: '11 Free AI Tools' },
                { icon: Headphones, label: 'Support & Help' },
              ].map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className={cn(commonStyles.tagline, styles.tagline)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', margin: 0 }}
                >
                  <Icon size={15} style={{ color: '#27AE60', flexShrink: 0 }} aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>
            {/* Newsletter CTA */}
            <div className={commonStyles.newsletterSection}>
              <p className={cn(commonStyles.newsletterLabel, styles.newsletterLabel)}>Stay Updated</p>
              {subscribed ? (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <ShieldCheck size={16} />
                  <span>🎉 Successfully subscribed to MegiLance updates!</span>
                </div>
              ) : (
                <form className={commonStyles.newsletterForm} onSubmit={handleSubscribe}>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Your email"
                    className={cn(commonStyles.newsletterInput, styles.newsletterInput)}
                    aria-label="Email address for newsletter subscription"
                  />
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className={cn(commonStyles.newsletterButton, styles.newsletterButton)}
                  >
                    {submitting ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </form>
              )}
            </div>
          </div>
          <div className={commonStyles.linksGrid}>
            {Object.entries(footerSections).map(([title, links]) => (
              <div key={title} className={commonStyles.linksColumn}>
                <h3 className={cn(commonStyles.linksTitle, styles.linksTitle)}>{title}</h3>
                <ul className={commonStyles.linksList}>
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link href={link.href} className={cn(commonStyles.linkItem, styles.linkItem)}><motion.span whileHover={{ y: -2, scale: 1.05 }} transition={{ type: "spring" as const, stiffness: 400, damping: 10 }}>{link.name}</motion.span></Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className={cn(commonStyles.bottomBar, styles.bottomBar)}>
          <p className={cn(commonStyles.copyright, styles.copyright)}>
            &copy; {new Date().getFullYear()} MegiLance, Inc. All rights reserved.
          </p>
          <div className={cn(commonStyles.linkItem, styles.linkItem)} style={{ display: 'flex', alignItems: 'center' }}>
            <ReportIssueButton variant="link" />
          </div>
          <div className={commonStyles.socialLinks}>
            {socialLinks.map((link) => (
              <a key={link.name} href={link.href} aria-label={link.name} className={cn(commonStyles.socialLink, styles.socialLink)}>
                <link.icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default PublicFooter;
