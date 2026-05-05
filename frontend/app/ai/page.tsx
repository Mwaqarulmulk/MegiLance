// @AI-HINT: AI Hub landing page showcasing all AI features available on MegiLance platform - Premium redesign
'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { useMounted } from '@/app/hooks/useMounted';
import { cn } from '@/lib/utils';
import Link from 'next/link';
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
  Brain
} from 'lucide-react';

const aiFeatures = [
  {
    title: 'AI Chatbot',
    description: 'Get instant answers to your questions about the platform, pricing, and finding freelancers. 24/7 intelligent support.',
    icon: MessageSquare,
    href: '/ai/chatbot',
    status: 'Live',
    color: 'blue',
    stats: 'Instant answers'
  },
  {
    title: 'Price Estimator',
    description: 'Get AI-powered price estimates for your projects based on market data, complexity, and historical patterns.',
    icon: DollarSign,
    href: '/ai/price-estimator',
    status: 'Live',
    color: 'green',
    stats: 'Data-driven pricing'
  },
  {
    title: 'Fraud Detection',
    description: 'Multi-layer protection system that analyzes users, projects, and proposals for potential risks in real-time.',
    icon: Shield,
    href: '/ai/fraud-check',
    status: 'Live',
    color: 'red',
    stats: 'Real-time protection'
  },
  {
    title: 'Smart Matching',
    description: 'Skill-based matching algorithm that connects you with the perfect freelancer or project using ML ranking.',
    icon: Search,
    href: '/explore',
    status: 'Live',
    color: 'purple',
    stats: 'ML-powered matching'
  },
  {
    title: 'Proposal Generator',
    description: 'AI-powered proposal templates to help you create professional cover letters that win projects.',
    icon: FileText,
    href: '/portal/freelancer',
    status: 'Live',
    color: 'orange',
    stats: 'Professional templates'
  },
  {
    title: 'Sentiment Analysis',
    description: 'Analyze reviews and feedback to understand client satisfaction and improve services.',
    icon: Sparkles,
    href: '/ai/chatbot',
    status: 'Beta',
    color: 'pink',
    stats: 'In Beta'
  },
  {
    title: 'Skill Analyzer',
    description: 'Assess your skills against 2025 market demand data, discover high-ROI skill gaps, and get a personalized growth roadmap.',
    icon: Brain,
    href: '/ai/skill-analyzer',
    status: 'Live',
    color: 'blue',
    stats: '80+ skills tracked'
  },
  {
    title: 'Rate Advisor',
    description: 'Get data-backed hourly rate recommendations with income projections and platform comparisons for your niche.',
    icon: TrendingUp,
    href: '/ai/rate-advisor',
    status: 'Live',
    color: 'green',
    stats: '70+ countries covered'
  },
  {
    title: 'Proposal Writer',
    description: 'Generate winning proposals with market-data pricing, skill matching, and a quality score to maximize your win rate.',
    icon: FileText,
    href: '/ai/proposal-writer',
    status: 'Live',
    color: 'orange',
    stats: 'AI-optimized copy'
  }
];

const capabilities = [
  { icon: Brain, label: 'Natural Language Processing', desc: 'Understand context and intent' },
  { icon: BarChart3, label: 'Predictive Analytics', desc: 'Forecast trends and outcomes' },
  { icon: Users, label: 'Behavioral Analysis', desc: 'Understand user patterns' },
  { icon: Lock, label: 'Security Intelligence', desc: 'Real-time threat detection' },
  { icon: Globe, label: 'Multi-language Support', desc: 'Multiple languages supported' },
  { icon: Layers, label: 'Deep Learning', desc: 'Advanced neural networks' },
];

const stats = [
  { value: 'ML', label: 'AI-Powered Platform' },
  { value: 'High', label: 'Uptime Reliability' },
  { value: 'Fast', label: 'Response Time' },
  { value: 'Multi', label: 'AI Models Integrated' },
];

const AIHubPage = () => {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();

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
      themeStyles.pageContainer
    )}>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={cn(
            'absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-3xl',
            isDark ? 'bg-blue-600/10' : 'bg-blue-400/10'
          )} />
          <div className={cn(
            'absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl',
            isDark ? 'bg-purple-600/10' : 'bg-purple-400/10'
          )} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className={cn(
              commonStyles.heroTag,
              themeStyles.heroTag,
              'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6'
            )}>
              <Bot className="w-4 h-4" />
              <span>Powered by Advanced Machine Learning</span>
              <Sparkles className="w-4 h-4" />
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              MegiLance{' '}
              <span className={cn(commonStyles.highlightText, themeStyles.highlightText)}>
                AI Hub
              </span>
            </h1>
            
            <p className={cn(
              commonStyles.heroDescription,
              themeStyles.heroDescription,
              'text-lg md:text-xl max-w-3xl mx-auto mb-10'
            )}>
              Experience the future of freelancing with our suite of AI-powered tools. 
              From intelligent matching to automated pricing, we leverage cutting-edge 
              machine learning to transform how you work.
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
                    {stat.value}
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
              <Link
                href="/ai/chatbot"
                className={cn(
                  "group inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:shadow-xl hover:-translate-y-0.5",
                  commonStyles.btnPrimary,
                  themeStyles.btnPrimary
                )}
              >
                <MessageSquare className="w-5 h-5" />
                <span>Try AI Chatbot</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/ai/price-estimator"
                className={cn(
                  'inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all',
                  commonStyles.btnSecondary,
                  themeStyles.btnSecondary
                )}
              >
                <DollarSign className="w-5 h-5" />
                <span>Estimate Price</span>
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
              AI-Powered Tools
            </h2>
            <p className={cn(
              'text-lg max-w-2xl mx-auto',
              commonStyles.sectionDesc,
              themeStyles.sectionDesc
            )}>
              Explore our comprehensive suite of intelligent tools designed to enhance every aspect of your freelancing experience.
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
                      'group block p-6 rounded-2xl border transition-all duration-300 h-full',
                      commonStyles.featureCard,
                      themeStyles.featureCard
                    )}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={cn(
                        'p-3 rounded-xl border',
                        commonStyles.featureIconWrapper,
                        themeStyles.featureIconWrapper
                      )}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={cn(
                        'px-3 py-1 rounded-full text-xs font-semibold',
                        feature.status === 'Live'
                          ? cn(commonStyles.featureStatusLive, themeStyles.featureStatusLive)
                          : cn(commonStyles.featureStatusBeta, themeStyles.featureStatusBeta)
                      )}>
                        {feature.status}
                      </span>
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
            <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl shadow-[0_0_120px_var(--ml-blue-light)]" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl shadow-[0_0_120px_var(--ml-purple-light)]" />
            
            <div className="relative z-10">
              <div className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6',
                commonStyles.ctaTag,
                themeStyles.ctaTag
              )}>
                <TrendingUp className="w-4 h-4" />
                <span>Start Your AI Journey</span>
              </div>

              <h2 className={cn(
                'text-2xl md:text-4xl font-bold mb-4',
                commonStyles.ctaTitle,
                themeStyles.ctaTitle
              )}>
                Ready to Experience AI-Powered Freelancing?
              </h2>
              <p className={cn(
                'text-lg mb-8 max-w-2xl mx-auto',
                commonStyles.ctaDescription,
                themeStyles.ctaDescription
              )}>
                Join thousands of freelancers and clients who are already using our AI tools 
                to work smarter, faster, and achieve better results.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/signup"
                  className={cn(
                    "inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all hover:shadow-xl hover:-translate-y-0.5",
                    commonStyles.btnPrimary,
                    themeStyles.btnPrimary
                  )}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Get Started Free</span>
                </Link>
                <Link
                  href="/ai/chatbot"
                  className={cn(
                    'inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all',
                    commonStyles.btnSecondaryLarge,
                    themeStyles.btnSecondaryLarge
                  )}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Try AI Chatbot Now</span>
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
