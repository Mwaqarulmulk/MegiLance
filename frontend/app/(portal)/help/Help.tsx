// @AI-HINT: Portal Help/Support Center page. Full-featured knowledge base with search, FAQ accordion, categories, quick links, status, and contact support.
'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api/core';
import { knowledgeBaseApi } from '@/lib/api';
import { PageTransition, ScrollReveal, StaggerContainer } from '@/app/components/Animations';
import { StaggerItem } from '@/app/components/Animations/StaggerContainer';
import { AnimatedOrb, ParticlesSystem, FloatingCube, FloatingSphere } from '@/app/components/3D';
import Button from '@/app/components/atoms/Button/Button';
import Input from '@/app/components/atoms/Input/Input';
import {
  Search, BookOpen, CreditCard, Shield, Users, Briefcase, Settings,
  MessageCircle, FileText, ChevronDown, ChevronUp, ExternalLink,
  Mail, Phone, Clock, CheckCircle, AlertCircle, HelpCircle,
  Zap, Star, Globe, Video, Award, TrendingUp, ArrowRight, Loader2,
} from 'lucide-react';
import common from './Help.common.module.css';
import light from './Help.light.module.css';
import dark from './Help.dark.module.css';

interface Category {
  title: string;
  desc: string;
  icon: React.ReactNode;
  href: string;
  articleCount: number;
}

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

interface QuickLink {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface VideoTutorial {
  title: string;
  duration: string;
  views: string;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Getting Started': <BookOpen size={24} />,
  'Billing & Payments': <CreditCard size={24} />,
  'Security & Privacy': <Shield size={24} />,
  'Finding Work': <Briefcase size={24} />,
  'Contracts & Projects': <FileText size={24} />,
  'Account Settings': <Settings size={24} />,
  'Teams & Collaboration': <Users size={24} />,
  'Communication': <MessageCircle size={24} />,
  'Growth & Analytics': <TrendingUp size={24} />,
};

const CATEGORY_HREFS: Record<string, string> = {
  'Getting Started': '/faq',
  'Billing & Payments': '/pricing',
  'Security & Privacy': '/security',
  'Finding Work': '/freelancer/jobs',
  'Contracts & Projects': '/freelancer/contracts',
  'Account Settings': '/settings',
  'Teams & Collaboration': '/freelancer/teams',
  'Communication': '/freelancer/messages',
  'Growth & Analytics': '/freelancer/analytics',
};

const quickLinks: QuickLink[] = [
  { label: 'Browse Projects', href: '/freelancer/jobs', icon: <Briefcase size={16} /> },
  { label: 'Submit a Proposal', href: '/freelancer/proposals', icon: <FileText size={16} /> },
  { label: 'Time Tracking', href: '/freelancer/time-entries', icon: <Clock size={16} /> },
  { label: 'Earnings Dashboard', href: '/freelancer/earnings', icon: <TrendingUp size={16} /> },
  { label: 'Skill Assessments', href: '/freelancer/assessments', icon: <Award size={16} /> },
  { label: 'Video Calls', href: '/freelancer/video-calls', icon: <Video size={16} /> },
];

const Help: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const themed = resolvedTheme === 'dark' ? dark : light;
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [faqFilter, setFaqFilter] = useState<string>('All');
  const [contactForm, setContactForm] = useState({ subject: '', message: '', email: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [videoTutorials, setVideoTutorials] = useState<VideoTutorial[]>([]);
  const [platformStatus, setPlatformStatus] = useState<'operational' | 'degraded' | 'down'>('operational');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [catsRes, faqsRes, videosRes, statusRes] = await Promise.allSettled([
        knowledgeBaseApi.getCategories(),
        apiFetch<{ question: string; answer: string; category: string }[]>('/knowledge-base/faqs'),
        apiFetch<VideoTutorial[]>('/knowledge-base/videos'),
        apiFetch<{ status: string }>('/health/ready'),
      ]);

      if (catsRes.status === 'fulfilled') {
        const raw = catsRes.value as Record<string, unknown>[];
        setCategories(raw.map((c) => ({
          title: (c.title as string) || (c.name as string) || '',
          desc: (c.description as string) || (c.desc as string) || '',
          icon: CATEGORY_ICONS[(c.title as string) || (c.name as string) || ''] || <BookOpen size={24} />,
          href: CATEGORY_HREFS[(c.title as string) || (c.name as string) || ''] || '/faq',
          articleCount: (c.article_count as number) || (c.articleCount as number) || 0,
        })));
      }
      if (faqsRes.status === 'fulfilled') {
        setFaqs(faqsRes.value);
      }
      if (videosRes.status === 'fulfilled') {
        setVideoTutorials(videosRes.value);
      }
      if (statusRes.status === 'fulfilled') {
        setPlatformStatus((statusRes.value as { status: string }).status === 'ok' ? 'operational' : 'degraded');
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredFAQs = useMemo(() => {
    let result = faqs;
    if (faqFilter !== 'All') {
      result = result.filter(f => f.category === faqFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(f =>
        f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
      );
    }
    return result;
  }, [searchQuery, faqFilter]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter(c =>
      c.title.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const faqCategories = useMemo(() => {
    const cats = ['All', ...new Set(faqs.map(f => f.category))];
    return cats;
  }, []);

  const toggleFAQ = useCallback((index: number) => {
    setExpandedFAQ(prev => prev === index ? null : index);
  }, []);

  const handleContactSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.subject.trim() || !contactForm.message.trim()) return;
    setFormSubmitted(true);
    setContactForm({ subject: '', message: '', email: '' });
    setTimeout(() => setFormSubmitted(false), 5000);
  }, [contactForm]);

  if (!resolvedTheme) return null;

  return (
    <PageTransition>
      <div className={common.bgDecorations}>
        <AnimatedOrb variant="blue" size={400} blur={90} opacity={0.08} className={common.orbTopLeft} />
        <AnimatedOrb variant="purple" size={350} blur={70} opacity={0.06} className={common.orbBottomRight} />
        <ParticlesSystem count={10} className={common.particles} />
        <div className={common.floatTopRight}><FloatingCube size={50} /></div>
        <div className={common.floatBottomLeft}><FloatingSphere size={40} /></div>
      </div>
      <main className={cn(common.page, themed.themeWrapper)}>
        <div className={common.container}>
          {/* Hero Header with Search */}
          <ScrollReveal>
            <div className={common.header}>
              <h1 className={common.title}>Help Center</h1>
              <p className={common.subtitle}>Find answers, learn best practices, and contact our support team.</p>
              <div className={common.searchBox}>
                <Search size={20} className={common.searchIcon} />
                <input
                  type="text"
                  className={cn(common.searchInput, themed.searchInput)}
                  placeholder="Search for help articles, FAQs, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search help articles"
                />
                {searchQuery && (
                  <button className={common.searchClear} onClick={() => setSearchQuery('')} aria-label="Clear search">
                    ×
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className={common.searchResults} role="status">
                  {filteredFAQs.length + filteredCategories.length} results for &ldquo;{searchQuery}&rdquo;
                </p>
              )}
            </div>
          </ScrollReveal>

          {/* Quick Links Bar */}
          <ScrollReveal delay={0.05}>
            <section className={common.quickLinksSection} aria-label="Quick links">
              <div className={common.quickLinksBar}>
                {quickLinks.map((link) => (
                  <Link key={link.label} href={link.href} className={cn(common.quickLink, themed.quickLink)}>
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>
            </section>
          </ScrollReveal>

          {/* Knowledge Base Categories */}
          <section aria-label="Help categories" className={common.section}>
            <ScrollReveal delay={0.1}>
              <h2 className={common.sectionTitle}>
                <Globe size={20} />
                Knowledge Base
              </h2>
            </ScrollReveal>
            <StaggerContainer className={common.grid}>
              {filteredCategories.map((c) => (
                <StaggerItem key={c.title}>
                  <Link href={c.href} className={cn(common.card, themed.card)} aria-label={`${c.title} — ${c.articleCount} articles`}>
                    <div className={cn(common.cardIcon, themed.cardIcon)}>{c.icon}</div>
                    <div className={common.cardTitle}>{c.title}</div>
                    <p className={common.cardDesc}>{c.desc}</p>
                    <span className={cn(common.cardMeta, themed.cardMeta)}>{c.articleCount} articles <ArrowRight size={14} /></span>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>

          {/* FAQ Section with Accordion */}
          <section className={common.section} aria-label="Frequently asked questions">
            <ScrollReveal delay={0.15}>
              <h2 className={common.sectionTitle}>
                <HelpCircle size={20} />
                Frequently Asked Questions
              </h2>
              <div className={common.faqFilters} role="tablist" aria-label="FAQ category filter">
                {faqCategories.map(cat => (
                  <button
                    key={cat}
                    role="tab"
                    aria-selected={faqFilter === cat}
                    className={cn(common.faqFilter, themed.faqFilter, faqFilter === cat && common.faqFilterActive, faqFilter === cat && themed.faqFilterActive)}
                    onClick={() => setFaqFilter(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </ScrollReveal>
            <div className={common.faqList}>
              {filteredFAQs.length === 0 ? (
                <div className={cn(common.emptyResult, themed.emptyResult)}>
                  <AlertCircle size={32} />
                  <p>No FAQs match your search. Try different keywords or <button className={common.textButton} onClick={() => { setSearchQuery(''); setFaqFilter('All'); }}>clear filters</button>.</p>
                </div>
              ) : (
                filteredFAQs.map((faq, idx) => (
                  <ScrollReveal key={idx} delay={0.02 * idx}>
                    <div className={cn(common.faqItem, themed.faqItem, expandedFAQ === idx && common.faqItemExpanded, expandedFAQ === idx && themed.faqItemExpanded)}>
                      <button
                        className={common.faqQuestion}
                        onClick={() => toggleFAQ(idx)}
                        aria-expanded={expandedFAQ === idx}
                        aria-controls={`faq-answer-${idx}`}
                      >
                        <span className={common.faqCategoryBadge}>{faq.category}</span>
                        <span className={common.faqQuestionText}>{faq.question}</span>
                        {expandedFAQ === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                      {expandedFAQ === idx && (
                        <div id={`faq-answer-${idx}`} className={cn(common.faqAnswer, themed.faqAnswer)} role="region">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  </ScrollReveal>
                ))
              )}
            </div>
          </section>

          {/* Video Tutorials */}
          <section className={common.section} aria-label="Video tutorials">
            <ScrollReveal delay={0.1}>
              <h2 className={common.sectionTitle}>
                <Video size={20} />
                Video Tutorials
              </h2>
            </ScrollReveal>
            <StaggerContainer className={common.tutorialsGrid}>
              {videoTutorials.map((video, idx) => (
                <StaggerItem key={idx}>
                  <div className={cn(common.tutorialCard, themed.tutorialCard)}>
                    <div className={cn(common.tutorialThumb, themed.tutorialThumb)}>
                      <Video size={32} />
                      <span className={common.tutorialDuration}>{video.duration}</span>
                    </div>
                    <div className={common.tutorialInfo}>
                      <h3 className={common.tutorialTitle}>{video.title}</h3>
                      <span className={cn(common.tutorialViews, themed.tutorialViews)}>{video.views} views</span>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>

          {/* Platform Status */}
          <section className={common.section} aria-label="Platform status">
            <ScrollReveal delay={0.1}>
              <div className={cn(common.statusBar, themed.statusBar)}>
                <div className={common.statusIndicator}>
                  {platformStatus === 'operational' ? (
                    <CheckCircle size={18} className={common.statusGreen} />
                  ) : (
                    <AlertCircle size={18} className={common.statusGreen} />
                  )}
                  <span className={common.statusText}>
                    {platformStatus === 'operational' ? 'All systems operational' : platformStatus === 'degraded' ? 'Some systems degraded' : 'System outage detected'}
                  </span>
                </div>
                <div className={common.statusLinks}>
                  <span className={cn(common.statusMeta, themed.statusMeta)}>
                    <Zap size={14} /> API: <strong>{platformStatus === 'operational' ? '99.9%' : '—'}</strong> uptime
                  </span>
                  <span className={cn(common.statusMeta, themed.statusMeta)}>
                    <Clock size={14} /> Last checked: just now
                  </span>
                </div>
              </div>
            </ScrollReveal>
          </section>

          {/* Contact Support Section */}
          <section className={common.section} aria-label="Contact support">
            <ScrollReveal delay={0.1}>
              <h2 className={common.sectionTitle}>
                <Mail size={20} />
                Still Need Help?
              </h2>
            </ScrollReveal>
            <div className={common.contactGrid}>
              <ScrollReveal delay={0.15}>
                <div className={cn(common.contactCard, themed.contactCard)}>
                  <MessageCircle size={28} />
                  <h3>Live Chat</h3>
                  <p>Chat with our support team in real-time. Average response time: 2 minutes.</p>
                  <Button variant="primary" size="sm">Start Chat</Button>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <div className={cn(common.contactCard, themed.contactCard)}>
                  <Mail size={28} />
                  <h3>Email Support</h3>
                  <p>Send us a detailed message. We respond within 24 hours on business days.</p>
                  <Button variant="outline" size="sm">support@megilance.com</Button>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.25}>
                <div className={cn(common.contactCard, themed.contactCard)}>
                  <Phone size={28} />
                  <h3>Priority Phone</h3>
                  <p>Available for Professional and Business plan subscribers. Mon–Fri 9 AM – 6 PM.</p>
                  <Button variant="outline" size="sm">Schedule Call</Button>
                </div>
              </ScrollReveal>
            </div>
          </section>

          {/* Submit Ticket Form */}
          <section className={common.section} aria-label="Submit a support ticket">
            <ScrollReveal delay={0.1}>
              <div className={cn(common.ticketForm, themed.ticketForm)}>
                <h2 className={common.ticketTitle}>
                  <FileText size={20} />
                  Submit a Support Ticket
                </h2>
                {formSubmitted ? (
                  <div className={cn(common.ticketSuccess, themed.ticketSuccess)}>
                    <CheckCircle size={32} />
                    <h3>Ticket Submitted!</h3>
                    <p>We&apos;ll get back to you within 24 hours. Check your email for a confirmation.</p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className={common.ticketFormInner}>
                    <div className={common.formRow}>
                      <label className={cn(common.formLabel, themed.formLabel)} htmlFor="help-subject">Subject</label>
                      <input
                        id="help-subject"
                        type="text"
                        className={cn(common.formInput, themed.formInput)}
                        placeholder="Brief description of your issue"
                        value={contactForm.subject}
                        onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                        required
                      />
                    </div>
                    <div className={common.formRow}>
                      <label className={cn(common.formLabel, themed.formLabel)} htmlFor="help-email">Email (optional)</label>
                      <input
                        id="help-email"
                        type="email"
                        className={cn(common.formInput, themed.formInput)}
                        placeholder="your@email.com"
                        value={contactForm.email}
                        onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div className={common.formRow}>
                      <label className={cn(common.formLabel, themed.formLabel)} htmlFor="help-message">Message</label>
                      <textarea
                        id="help-message"
                        className={cn(common.formTextarea, themed.formTextarea)}
                        placeholder="Describe your issue in detail..."
                        rows={5}
                        value={contactForm.message}
                        onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                        required
                      />
                    </div>
                    <Button variant="primary" type="submit">Submit Ticket</Button>
                  </form>
                )}
              </div>
            </ScrollReveal>
          </section>

          {/* Bottom CTA */}
          <section className={common.section} aria-label="Additional resources">
            <ScrollReveal>
              <div className={common.cta}>
                <Link href="/freelancer/support" className={common.button} aria-label="Go to Support">
                  <Star size={16} /> Support Portal
                </Link>
                <Link href="/contact" className={cn(common.button, common.buttonSecondary, themed.buttonSecondary)} aria-label="Contact us">
                  <Mail size={16} /> Contact Us
                </Link>
              </div>
            </ScrollReveal>
          </section>
        </div>
      </main>
    </PageTransition>
  );
};

export default Help;
