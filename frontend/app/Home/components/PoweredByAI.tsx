// @AI-HINT: "Powered by Enterprise-Grade AI" section component showcasing MegiLance's AI infrastructure, machine learning capabilities, and AI-driven features. Includes interactive feature cards, tech stack display, and performance metrics.

'use client';

import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import {
  BrainCircuit,
  TrendingUp,
  ShieldCheck,
  MessageCircle,
  BarChart,
  Zap,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

import commonStyles from './PoweredByAI.common.module.css';
import lightStyles from './PoweredByAI.light.module.css';
import darkStyles from './PoweredByAI.dark.module.css';

interface AIFeature {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  metric: string;
  metricValue: string;
  variant: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'teal' | 'pink';
}

const aiFeatures: AIFeature[] = [
  {
    id: 'matching',
    icon: <BrainCircuit />,
    title: 'Intelligent Job Matching',
    description:
      'Our AI analyzes your skills, experience, and portfolio to match you with high-value projects that perfectly align with your expertise.',
    metric: 'Match Accuracy',
    metricValue: '97%',
    variant: 'blue',
  },
  {
    id: 'pricing',
    icon: <TrendingUp />,
    title: 'Dynamic Price Modeling',
    description:
      'Get data-driven pricing recommendations based on real-time market trends, demand signals, and historical project data to maximize earnings.',
    metric: 'Earning Potential',
    metricValue: '+25%',
    variant: 'green',
  },
  {
    id: 'fraud',
    icon: <ShieldCheck />,
    title: 'Proactive Fraud Shield',
    description:
      'Advanced machine learning algorithms continuously monitor transactions and user behavior to protect you from scams and fraudulent activity.',
    metric: 'Security Level',
    metricValue: '99.9%',
    variant: 'red',
  },
  {
    id: 'support',
    icon: <MessageCircle />,
    title: 'Contextual AI Assist',
    description:
      '24/7 intelligent chatbot support for platform guidance, proposal generation, dispute resolution, and strategic career advice.',
    metric: 'Response Time',
    metricValue: '<1min',
    variant: 'purple',
  },
  {
    id: 'analytics',
    icon: <BarChart />,
    title: 'Performance Analytics',
    description:
      'AI-powered insights help you optimize your profile, track performance trends, identify strengths, and accelerate career growth with actionable recommendations.',
    metric: 'Growth Impact',
    metricValue: '3x Faster',
    variant: 'orange',
  },
  {
    id: 'automation',
    icon: <Zap />,
    title: 'Automated Workflows',
    description:
      'Intelligent automation handles routine tasks like invoicing, milestone tracking, payment processing, and project updates—freeing you to focus on your craft.',
    metric: 'Time Saved Weekly',
    metricValue: '10+ Hours',
    variant: 'teal',
  },
  {
    id: 'insights',
    icon: <Sparkles />,
    title: 'Predictive Career Insights',
    description:
      'Machine learning models predict market trends, emerging skills in demand, and optimal project timing to keep you ahead of the competition.',
    metric: 'Accuracy',
    metricValue: '96%',
    variant: 'pink',
  },
];

const techStackData = [
  { name: 'TensorFlow', type: 'Deep Learning' },
  { name: 'OpenAI', type: 'Language Models' },
  { name: 'PyTorch', type: 'ML Framework' },
  { name: 'Hugging Face', type: 'NLP Models' },
  { name: 'scikit-learn', type: 'ML Tools' },
];

interface FeatureCardProps {
  feature: AIFeature;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  themeStyles: any;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  feature,
  isHovered,
  onHover,
  themeStyles,
}) => {
  const variantClass = `variant${feature.variant.charAt(0).toUpperCase() + feature.variant.slice(1)}`;

  return (
    <div
      className={cn(
        commonStyles.featureCard,
        commonStyles[variantClass as keyof typeof commonStyles],
        themeStyles.featureCard,
        isHovered && commonStyles.featureCardHovered
      )}
      onMouseEnter={() => onHover(feature.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Gradient Accent Line */}
      <div className={commonStyles.accentLine} />

      {/* Icon */}
      <div className={cn(commonStyles.iconWrapper, commonStyles[variantClass as keyof typeof commonStyles])}>
        {feature.icon}
      </div>

      {/* Metric Badge */}
      <div className={commonStyles.metricBadge}>
        <span className={commonStyles.metricValue}>{feature.metricValue}</span>
        <span className={commonStyles.metricLabel}>{feature.metric}</span>
      </div>

      {/* Content */}
      <div className={commonStyles.cardContent}>
        <h3 className={cn(commonStyles.cardTitle, themeStyles.cardTitle)}>
          {feature.title}
        </h3>
        <p className={cn(commonStyles.cardDescription, themeStyles.cardDescription)}>
          {feature.description}
        </p>
      </div>

      {/* CTA Arrow (Visible on Hover) */}
      <div className={cn(commonStyles.ctaArrow, isHovered && commonStyles.ctaArrowVisible)}>
        <ArrowRight size={20} />
      </div>
    </div>
  );
};

const PoweredByAI: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const themeStyles = resolvedTheme === 'dark' ? darkStyles : lightStyles;
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <section className={cn(commonStyles.section, themeStyles.section)}>
      {/* Background Animation */}
      <div className={commonStyles.backgroundElements}>
        <div className={commonStyles.gradientOrb1} />
        <div className={commonStyles.gradientOrb2} />
        <div className={commonStyles.gradientOrb3} />
      </div>

      <div className={commonStyles.container}>
        {/* Section Header */}
        <div className={cn(commonStyles.header, themeStyles.header)}>
          <div className={cn(commonStyles.badge, themeStyles.badge)}>
            <Sparkles size={16} />
            <span>AI-Powered Platform</span>
          </div>

          <h2 className={cn(commonStyles.heading, themeStyles.heading)}>
            Powered by
            <br />
            <span className={commonStyles.highlightText}>Enterprise-Grade AI</span>
          </h2>

          <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>
            Your AI Co-Pilot for Freelance Success. MegiLance integrates cutting-edge machine
            learning to automate the mundane and amplify your potential. Our models are trained
            on millions of successful projects to give you a competitive edge.
          </p>
        </div>

        {/* Features Grid */}
        <div className={commonStyles.featuresGrid}>
          {aiFeatures.map((feature) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              isHovered={hoveredCard === feature.id}
              onHover={setHoveredCard}
              themeStyles={themeStyles}
            />
          ))}
        </div>

        {/* Tech Stack Section */}
        <div className={cn(commonStyles.techStackSection, themeStyles.techStackSection)}>
          <div className={commonStyles.techStackHeader}>
            <h3 className={cn(commonStyles.techStackTitle, themeStyles.techStackTitle)}>
              Built with Industry-Leading Technology
            </h3>
            <p className={cn(commonStyles.techStackSubtitle, themeStyles.techStackSubtitle)}>
              Leveraging the most advanced AI and machine learning frameworks available
            </p>
          </div>

          <div className={commonStyles.techStack}>
            {techStackData.map((tech, idx) => (
              <div key={idx} className={commonStyles.techItem}>
                <div className={commonStyles.techIcon}>
                  <BrainCircuit size={24} />
                </div>
                <div className={commonStyles.techInfo}>
                  <div className={cn(commonStyles.techName, themeStyles.techName)}>
                    {tech.name}
                  </div>
                  <div className={cn(commonStyles.techType, themeStyles.techType)}>
                    {tech.type}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Capabilities Summary */}
        <div className={cn(commonStyles.capabilitiesSection, themeStyles.capabilitiesSection)}>
          <h3 className={cn(commonStyles.capabilitiesTitle, themeStyles.capabilitiesTitle)}>
            AI Capabilities
          </h3>
          <div className={commonStyles.capabilitiesGrid}>
            {[
              { icon: '🎯', text: 'Smart skill-based job matching' },
              { icon: '📊', text: 'Real-time market analysis' },
              { icon: '🛡️', text: 'Continuous fraud monitoring' },
              { icon: '💡', text: 'Intelligent proposal suggestions' },
              { icon: '⚡', text: 'Automated task completion' },
              { icon: '📈', text: 'Predictive performance insights' },
            ].map((item, idx) => (
              <div key={idx} className={commonStyles.capabilityItem}>
                <span className={commonStyles.capabilityIcon}>{item.icon}</span>
                <span className={cn(commonStyles.capabilityText, themeStyles.capabilityText)}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PoweredByAI;
