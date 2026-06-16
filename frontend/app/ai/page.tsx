// @AI-HINT: AI Hub landing page showcasing all AI features available on MegiLance platform - Premium redesign
'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { useMounted } from '@/app/hooks/useMounted';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import commonStyles from './AiHub.common.module.css';
import lightStyles from './AiHub.light.module.css';
import darkStyles from './AiHub.dark.module.css';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  DollarSign,
  Shield,
  Search,
  FileText,
  Sparkles,
  ArrowRight,
  Bot,
  BarChart3,
  Users,
  Lock,
  Globe,
  Layers,
  TrendingUp,
  CheckCircle2,
  Brain,
  Calculator
} from 'lucide-react';
import {
  AuroraBackground,
  ShineBadge,
  AnimatedGradientText,
  NumberTicker,
  ShimmerButton,
  MagicCard,
  BorderBeam,
  Meteors,
} from '@/app/components/AI/kit';

const aiFeatures = [
  {
    title: 'AI Chatbot',
    description: 'Get instant answers about freelancing, pricing, and finding talent. 24/7 intelligent support powered by AI.',
    icon: MessageSquare,
    href: '/ai/chatbot',
    status: 'Live',
    color: 'blue',
    stats: 'Instant answers',
    free: true,
  },
  {
    title: 'Price Estimator',
    description: 'Get AI-powered price estimates for any project based on real market data across 10 industries and 100+ service types.',
    icon: DollarSign,
    href: '/ai/price-estimator',
    status: 'Live',
    color: 'green',
    stats: '100+ services',
    free: true,
  },
  {
    title: 'Proposal Writer',
    description: 'Generate winning proposals with market-data pricing, skill matching, and a quality score to maximize your win rate.',
    icon: FileText,
    href: '/ai/proposal-writer',
    status: 'Live',
    color: 'orange',
    stats: 'AI-optimized copy',
    free: true,
  },
  {
    title: 'Rate Advisor',
    description: 'Get data-backed hourly rate recommendations with income projections and platform comparisons for your niche.',
    icon: TrendingUp,
    href: '/ai/rate-advisor',
    status: 'Live',
    color: 'cyan',
    stats: '70+ countries',
    free: true,
  },
  {
    title: 'Scope Planner',
    description: 'Plan project scope, milestones, timeline, and budget with AI-powered breakdown and risk assessment.',
    icon: Layers,
    href: '/ai/scope-planner',
    status: 'Live',
    color: 'purple',
    stats: 'Smart planning',
    free: true,
  },
  {
    title: 'Skill Analyzer',
    description: 'Assess your skills against market demand, discover high-ROI skill gaps, and get a personalized growth roadmap.',
    icon: Brain,
    href: '/ai/skill-analyzer',
    status: 'Live',
    color: 'indigo',
    stats: '80+ skills',
    free: true,
  },
  {
    title: 'Income Calculator',
    description: 'Project your freelance income, taxes, savings, and financial health with country-specific calculations.',
    icon: BarChart3,
    href: '/ai/income-calculator',
    status: 'Live',
    color: 'emerald',
    stats: 'Tax-aware',
    free: true,
  },
  {
    title: 'Expense & Tax Calculator',
    description: 'Plan self-employment taxes, quarterly estimates, and business deductions with country-specific rules.',
    icon: Calculator,
    href: '/ai/expense-calculator',
    status: 'Live',
    color: 'amber',
    stats: 'Quarterly estimates',
    free: true,
  },
  {
    title: 'Invoice Generator',
    description: 'Create professional invoices with line items, tax calculations, and multiple currency support.',
    icon: FileText,
    href: '/ai/invoice-generator',
    status: 'Live',
    color: 'rose',
    stats: 'Multi-currency',
    free: true,
  },
  {
    title: 'Contract Builder',
    description: 'Generate legally-sound freelance contracts with customizable clauses, IP terms, and jurisdiction support.',
    icon: Shield,
    href: '/ai/contract-builder',
    status: 'Live',
    color: 'teal',
    stats: 'Legal clauses',
    free: true,
  },
  {
    title: 'Fraud Check',
    description: 'Analyze project descriptions and messages for scam patterns, suspicious payment terms, and red flags.',
    icon: Search,
    href: '/ai/fraud-check',
    status: 'Live',
    color: 'red',
    stats: 'Scam detection',
    free: true,
  },
];

const capabilities = [
  { icon: Brain, label: 'Natural Language', desc: 'Understand your queries' },
  { icon: BarChart3, label: 'Market Data', desc: 'Real industry pricing' },
  { icon: Users, label: 'Skill Matching', desc: 'Personalized analysis' },
  { icon: Lock, label: 'Privacy First', desc: 'No data stored for guests' },
  { icon: Globe, label: 'Global Coverage', desc: '70+ countries supported' },
  { icon: Layers, label: 'Instant Results', desc: 'Real-time AI processing' },
];

const stats: { value: string; label: string; num?: number; suffix?: string }[] = [
  { value: '11', label: 'Free AI Tools', num: 11 },
  { value: '100%', label: 'Free to Use', num: 100, suffix: '%' },
  { value: 'Instant', label: 'No Sign-up Required' },
  { value: 'AI', label: 'Powered by ML' },
];

const AIHubPage = () => {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();
  const router = useRouter();

  const isDark = mounted && resolvedTheme === 'dark';
  const themeStyles = isDark ? darkStyles : lightStyles;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className={cn(
      commonStyles.pageContainer,
      themeStyles.pageContainer,
      'relative'
    )}>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16">
        {/* Premium animated backdrop */}
        <AuroraBackground isDark={isDark} particleCount={70} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 flex justify-center">
              <ShineBadge className={cn(isDark ? 'text-blue-100' : 'text-blue-700')}>
                <Bot className="w-4 h-4" />
                <span>11 Free AI Tools — No Sign-up Required</span>
                <Sparkles className="w-4 h-4 opacity-70" />
              </ShineBadge>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              MegiLance{' '}
              <AnimatedGradientText>AI Hub</AnimatedGradientText>
            </h1>
            
            <p className={cn(
              commonStyles.heroDescription,
              themeStyles.heroDescription,
              'text-lg md:text-xl max-w-3xl mx-auto mb-10'
            )}>
              11 free AI-powered tools to supercharge your freelancing career. 
              Estimate prices, write proposals, plan projects, analyze skills, and more — 
              all instantly accessible, no account needed.
            </p>

            {/* Stats Row */}
            <motion.div 
              className="flex flex-wrap justify-center gap-8 mb-12"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {stats.map((stat, index) => (
                <motion.div 
                  key={index}
                  variants={itemVariants}
                  className={cn(
                    'px-6 py-4 rounded-2xl',
                    commonStyles.statCard,
                    themeStyles.statCard
                  )}
                >
                  <div className={cn("text-2xl md:text-3xl font-bold", commonStyles.highlightText, themeStyles.highlightText)}>
                    {stat.num != null ? (
                      <NumberTicker value={stat.num} suffix={stat.suffix} />
                    ) : (
                      stat.value
                    )}
                  </div>
                  <div className={cn(
                    'text-sm',
                    commonStyles.statLabel,
                    themeStyles.statLabel
                  )}>
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-4">
              <ShimmerButton
                onClick={() => router.push('/ai/price-estimator')}
                borderRadius="14px"
                className="group gap-2 px-6 py-3 text-base font-semibold"
              >
                <DollarSign className="w-5 h-5" />
                <span>Estimate a Price</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </ShimmerButton>
              <Link
                href="/ai/proposal-writer"
                className={cn(
                  'inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all',
                  commonStyles.btnSecondary,
                  themeStyles.btnSecondary
                )}
              >
                <FileText className="w-5 h-5" />
                <span>Write a Proposal</span>
              </Link>
              <Link
                href="/ai/chatbot"
                className={cn(
                  'inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all',
                  commonStyles.btnSecondary,
                  themeStyles.btnSecondary
                )}
              >
                <MessageSquare className="w-5 h-5" />
                <span>Ask AI</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className={cn(
              'text-3xl md:text-4xl font-bold mb-4',
              commonStyles.sectionTitle,
              themeStyles.sectionTitle
            )}>
              All 11 AI Tools — 100% Free
            </h2>
            <p className={cn(
              'text-lg max-w-2xl mx-auto',
              commonStyles.sectionDesc,
              themeStyles.sectionDesc
            )}>
              Every tool is free to use with no sign-up required. Sign up for unlimited usage and saved history.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {aiFeatures.map((feature) => {
              const Icon = feature.icon;
              
              return (
                <motion.div key={feature.title} variants={itemVariants}>
                  <Link
                    href={feature.href}
                    className={cn(
                      'group relative block p-6 rounded-2xl border transition-all duration-300 h-full overflow-hidden',
                      commonStyles.featureCard,
                      themeStyles.featureCard
                    )}
                  >
                    {/* animated border beam on hover */}
                    <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                      <BorderBeam size={130} duration={6} borderWidth={1.5} />
                    </div>
                    <div className="flex items-start justify-between mb-4">
                      <div className={cn(
                        'p-3 rounded-xl border',
                        commonStyles.featureIconWrapper,
                        themeStyles.featureIconWrapper
                      )}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex items-center gap-2">
                        {feature.free && (
                          <span className={cn(
                            'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
                            commonStyles.featureStatusLive,
                            themeStyles.featureStatusLive
                          )}>
                            Free
                          </span>
                        )}
                        <span className={cn(
                          'px-3 py-1 rounded-full text-xs font-semibold',
                          feature.status === 'Live'
                            ? cn(commonStyles.featureStatusLive, themeStyles.featureStatusLive)
                            : cn(commonStyles.featureStatusBeta, themeStyles.featureStatusBeta)
                        )}>
                          {feature.status}
                        </span>
                      </div>
                    </div>
                    
                    <h3 className={cn(
                      'text-xl font-bold mb-2',
                      commonStyles.featureTitle,
                      themeStyles.featureTitle
                    )}>
                      {feature.title}
                    </h3>
                    
                    <p className={cn(
                      'text-sm mb-4 min-h-[60px]',
                      commonStyles.featureDesc,
                      themeStyles.featureDesc
                    )}>
                      {feature.description}
                    </p>

                    <div className={cn(
                      'flex items-center justify-between pt-4 border-t',
                      commonStyles.featureFooter,
                      themeStyles.featureFooter
                    )}>
                      <span className={cn(
                        'text-xs font-medium',
                        commonStyles.featureStats,
                        themeStyles.featureStats
                      )}>
                        {feature.stats}
                      </span>
                      <div className={cn(
                        'flex items-center gap-1 text-sm font-medium transition-transform group-hover:translate-x-1',
                        commonStyles.exploreLink,
                        themeStyles.exploreLink
                      )}>
                        <span>Explore</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className={cn(
        'py-16',
        commonStyles.capabilitiesSection,
        themeStyles.capabilitiesSection
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className={cn(
              'text-3xl md:text-4xl font-bold mb-4',
              commonStyles.sectionTitle,
              themeStyles.sectionTitle
            )}>
              AI Capabilities
            </h2>
            <p className={cn(
              'text-lg max-w-2xl mx-auto',
              commonStyles.sectionDesc,
              themeStyles.sectionDesc
            )}>
              Our AI infrastructure is built on state-of-the-art technologies to deliver reliable, accurate, and fast results.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {capabilities.map((cap, index) => {
              const Icon = cap.icon;
              return (
                <motion.div 
                  key={index}
                  variants={itemVariants}
                  className={cn(
                    'p-4 rounded-xl text-center transition-all hover:-translate-y-1',
                    commonStyles.capabilityCard,
                    themeStyles.capabilityCard
                  )}
                >
                  <div className={cn(
                    'w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center',
                    commonStyles.capIconWrapper,
                    themeStyles.capIconWrapper
                  )}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className={cn(
                    'font-semibold text-sm mb-1',
                    commonStyles.capTitle,
                    themeStyles.capTitle
                  )}>
                    {cap.label}
                  </h3>
                  <p className={cn(
                    'text-xs',
                    commonStyles.capDesc,
                    themeStyles.capDesc
                  )}>
                    {cap.desc}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className={cn(
              'rounded-3xl p-8 md:p-12 text-center relative overflow-hidden',
              commonStyles.ctaBox,
              themeStyles.ctaBox
            )}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Meteors number={14} />
            <BorderBeam size={220} duration={10} />
            <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl shadow-[0_0_120px_var(--ml-blue-light)]" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl shadow-[0_0_120px_var(--ml-purple-light)]" />
            
            <div className="relative z-10">
              <div className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6',
                commonStyles.ctaTag,
                themeStyles.ctaTag
              )}>
                <TrendingUp className="w-4 h-4" />
                <span>Start Using AI Tools Now</span>
              </div>

              <h2 className={cn(
                'text-2xl md:text-4xl font-bold mb-4',
                commonStyles.ctaTitle,
                themeStyles.ctaTitle
              )}>
                All Tools Are Free — No Account Needed
              </h2>
              <p className={cn(
                'text-lg mb-8 max-w-2xl mx-auto',
                commonStyles.ctaDescription,
                themeStyles.ctaDescription
              )}>
                Start using all 11 AI tools instantly. Sign up to unlock unlimited usage, 
                save your history, and access premium features.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <ShimmerButton
                  onClick={() => router.push('/ai/price-estimator')}
                  borderRadius="14px"
                  className="gap-2 px-8 py-4 text-base font-semibold"
                >
                  <DollarSign className="w-5 h-5" />
                  <span>Try Price Estimator</span>
                </ShimmerButton>
                <Link
                  href="/ai/chatbot"
                  className={cn(
                    'inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all',
                    commonStyles.btnSecondaryLarge,
                    themeStyles.btnSecondaryLarge
                  )}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Chat with AI</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AIHubPage;
