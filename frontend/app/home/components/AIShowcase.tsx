// @AI-HINT: This component showcases AI-powered features with accurate status indicators showing what's actually deployed and working.

'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { 
  BrainCircuit, TrendingUp, ShieldCheck, MessageCircle, Cpu, Zap,
  CheckCircle2, Cloud, FileText, Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMounted } from '@/app/hooks/useMounted';

import AIShowcaseCard from './AIShowcaseCard';
import { LottieAnimation, aiSparkleAnimation } from '@/app/components/Animations/LottieAnimation';
import commonStyles from './AIShowcase.common.module.css';
import lightStyles from './AIShowcase.light.module.css';
import darkStyles from './AIShowcase.dark.module.css';

// --- SVG Logo Components (Only showing what we actually use) ---
const HuggingFaceLogo = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Hugging Face</title><path d="M20.56 17.39a8.312 8.312 0 0 1-11.752 0L12 20.561l3.28-3.17zm-1.64-1.64a6.208 6.208 0 0 0-8.784 0l.168.168c.024.024 2.544 2.592 4.224 2.592s4.2-2.568 4.224-2.592l.168-.168zM12 14.24a.84.84 0 1 1 0-1.68.84.84 0 0 1 0 1.68zm-3.36-2.52a.84.84 0 1 1 0-1.68.84.84 0 0 1 0 1.68zm6.72 0a.84.84 0 1 1 0-1.68.84.84 0 0 1 0 1.68zM17.385 3.44a8.312 8.312 0 0 1 0 11.752l-1.63-1.64a6.208 6.208 0 0 0 0-8.472l1.63-1.64zM6.615 3.44a8.312 8.312 0 0 1 10.77 0L15.755 5.08a6.208 6.208 0 0 0-7.512 0L6.615 3.44zM3.44 6.615a8.312 8.312 0 0 1 0-11.752L5.08 6.495a6.208 6.208 0 0 0 0 8.472L3.44 6.615z" fill="#FFD21E"/></svg>
);

const FastAPILogo = () => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>FastAPI</title><path d="M12 0C5.375 0 0 5.375 0 12c0 6.627 5.375 12 12 12 6.626 0 12-5.373 12-12 0-6.625-5.373-12-12-12zm-.624 21.62v-7.528H7.19L13.203 2.38v7.528h4.029L11.376 21.62z" fill="#009688"/></svg>
);

const PythonLogo = () => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Python</title><path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z" fill="#3776AB"/></svg>
);

const TursoLogo = () => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Turso (libSQL)</title><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
);

const NextJSLogo = () => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Next.js</title><path d="M18.665 21.978C16.758 23.255 14.465 24 12 24 5.377 24 0 18.623 0 12S5.377 0 12 0s12 5.377 12 12c0 3.583-1.574 6.801-4.067 9.001L9.219 7.2H7.2v9.596h1.615V9.251l9.85 12.727Zm-3.332-8.533 1.6 2.061V7.2h-1.6v6.245Z" fill="currentColor"/></svg>
);

// --- Status Badge Component ---
interface StatusBadgeProps {
  status: 'live' | 'beta' | 'smart';
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const labels = {
    live: '✓ Live',
    beta: 'β Beta',
    smart: '⚡ Smart Rules'
  };
  
  return (
    <span className={cn(commonStyles.statusBadge, commonStyles[`status${status.charAt(0).toUpperCase() + status.slice(1)}`], className)}>
      {labels[status]}
    </span>
  );
};

// --- Data Definitions (Accurate to what's deployed) ---
const aiFeaturesData = [
  { 
    icon: <BrainCircuit />, 
    title: 'Smart Job Matching', 
    description: 'Skill-based matching algorithm compares your expertise with project requirements for optimal matches.', 
    stats: 'Skill Overlap Scoring',
    status: 'live' as const
  },
  { 
    icon: <TrendingUp />, 
    title: 'Price Estimation', 
    description: 'Data-driven pricing based on category averages, complexity factors, and market rates from our database.', 
    stats: 'Market-Based',
    status: 'live' as const
  },
  { 
    icon: <ShieldCheck />, 
    title: 'Fraud Detection', 
    description: 'Multi-layer protection: keyword analysis, pattern detection, and risk scoring for users, projects, and proposals.', 
    stats: 'Real-time Checks',
    status: 'live' as const
  },
  { 
    icon: <MessageCircle />, 
    title: 'AI Chatbot', 
    description: 'Intelligent assistant that helps with platform navigation, pricing queries, and freelancer recommendations.', 
    stats: 'Instant Response',
    status: 'live' as const
  },
  { 
    icon: <FileText />, 
    title: 'Proposal Generator', 
    description: 'Professional proposal templates generated based on project context and industry best practices.', 
    stats: 'Template-Based',
    status: 'live' as const
  },
  { 
    icon: <Search />, 
    title: 'Semantic Embeddings', 
    description: 'Vector embeddings for semantic search and similarity matching powered by sentence-transformers.', 
    stats: '384 Dimensions',
    status: 'beta' as const
  },
];

const techStackData = [
  { name: 'Hugging Face', Logo: HuggingFaceLogo, role: 'Model Hosting', desc: 'Hosting our AI microservice with sentence-transformers embeddings.' },
  { name: 'FastAPI', Logo: FastAPILogo, role: 'AI Backend', desc: 'High-performance Python API for ML inference and routing.' },
  { name: 'Python', Logo: PythonLogo, role: 'AI Engine', desc: 'Powering our intelligent algorithms and data processing.' },
  { name: 'Turso', Logo: TursoLogo, role: 'Edge Database', desc: 'SQLite-compatible database for fast queries and analytics.' },
  { name: 'Next.js', Logo: NextJSLogo, role: 'Frontend', desc: 'React framework with server components for optimal UX.' },
];

// --- Sub-Components ---
const BackgroundGrid = () => (
  <div className={cn(commonStyles.backgroundGrid)} />
);

const TechLogos = () => {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();
  const themeStyles = (mounted && resolvedTheme === 'dark') ? darkStyles : lightStyles;

  return (
    <div className={cn(commonStyles.techStack, themeStyles.techStack)}>
      <div className={commonStyles.techHeader}>
        <h3 className={cn(commonStyles.techTitle, themeStyles.techTitle)}>Our Technology Stack</h3>
        <p className={cn(commonStyles.techSubtitle, themeStyles.techSubtitle)}>
          Built with modern, production-ready technologies for reliability and performance.
        </p>
      </div>
      <div className={cn(commonStyles.techLogos, themeStyles.techLogos)}>
        {techStackData.map(({ name, Logo, role, desc }) => (
          <div key={name} className={cn(commonStyles.techLogo, themeStyles.techLogo)}>
            <div className={commonStyles.techIconWrapper}>
              <Logo />
            </div>
            <div className={commonStyles.techContent}>
              <span className={cn(themeStyles.techLogoName)}>{name}</span>
              <span className={cn(commonStyles.techRole)}>{role}</span>
              <p className={cn(commonStyles.techDesc)}>{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main Component ---
const AIShowcase: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();
  const themeStyles = (mounted && resolvedTheme === 'dark') ? darkStyles : lightStyles;

  return (
    <section className={cn(commonStyles.aiShowcase, themeStyles.aiShowcase)}>
      <BackgroundGrid />
      <div className={cn(commonStyles.container)}>
        <div className={cn(commonStyles.header)}>
          <div className={cn(commonStyles.badge, themeStyles.badge)}>
            <Zap className={cn(commonStyles.badgeIcon)} />
            <span>AI-Powered Platform</span>
          </div>
          <LottieAnimation
            animationData={aiSparkleAnimation}
            width={100}
            height={100}
            ariaLabel="AI-powered illustration"
            className="mx-auto mb-2"
          />
          <h2 className={cn(commonStyles.title, themeStyles.title)}>
            Smart Features for Freelance Success
          </h2>
          <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>
            MegiLance uses intelligent algorithms and machine learning to streamline your workflow. 
            Our AI services are live and continuously improving to give you a competitive edge.
          </p>
        </div>

        <div className={cn(commonStyles.grid)}>
          {aiFeaturesData.map((feature) => (
            <AIShowcaseCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              stats={feature.stats}
              status={feature.status}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default AIShowcase;
