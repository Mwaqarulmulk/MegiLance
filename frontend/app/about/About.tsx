// @AI-HINT: The About Us page, fully refactored for premium quality with modular components and animations.
'use client';

import React, { useRef } from 'react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import { FaUsers, FaLightbulb, FaShieldAlt } from 'react-icons/fa';

import commonStyles from './About.common.module.css';
import lightStyles from './About.light.module.css';
import darkStyles from './About.dark.module.css';

// --- Data ---
const values = [
  { icon: FaLightbulb, title: 'Innovation', description: 'We constantly push the boundaries of technology to build a smarter freelance ecosystem.' },
  { icon: FaUsers, title: 'Community', description: 'We foster a supportive and collaborative environment for both clients and freelancers.' },
  { icon: FaShieldAlt, title: 'Integrity', description: 'We operate with transparency and fairness, ensuring trust and security for all users.' },
];

const teamMembers = [
  { name: 'Dr. Evelyn Reed', role: 'Founder & CEO', avatar: '/avatars/evelyn.jpg' },
  { name: 'Marcus Chen', role: 'Chief Technology Officer', avatar: '/avatars/marcus.jpg' },
  { name: 'Isabella Rossi', role: 'Head of Product', avatar: '/avatars/isabella.jpg' },
  { name: 'Leo Martinez', role: 'Lead Blockchain Engineer', avatar: '/avatars/leo.jpg' },
];

// --- Subcomponents ---
const AnimatedSection: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(ref, { threshold: 0.2 });
  return (
    <section ref={ref} className={cn(commonStyles.section, isVisible && commonStyles.isVisible, className)}>
      {children}
    </section>
  );
};

const ValueCard: React.FC<{ value: typeof values[0]; themeStyles: any }> = ({ value, themeStyles }) => (
  <div className={cn(commonStyles.valueCard, themeStyles.valueCard)}>
    <value.icon className={cn(commonStyles.valueIcon, themeStyles.valueIcon)} aria-hidden="true" />
    <h3 className={commonStyles.valueTitle}>{value.title}</h3>
    <p className={commonStyles.valueDescription}>{value.description}</p>
  </div>
);

const TeamMemberCard: React.FC<{ member: typeof teamMembers[0]; themeStyles: any }> = ({ member, themeStyles }) => (
  <div className={cn(commonStyles.teamCard, themeStyles.teamCard)}>
    <Image src={member.avatar} alt={`Portrait of ${member.name}`} width={120} height={120} className={commonStyles.teamAvatar} />
    <h3 className={commonStyles.teamName}>{member.name}</h3>
    <p className={commonStyles.teamRole}>{member.role}</p>
  </div>
);

// --- Main Component ---
const About: React.FC = () => {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  return (
    <main id="main-content" role="main" className={cn(commonStyles.aboutPage, themeStyles.aboutPage)}>
      <div className={commonStyles.container}>
        <header className={commonStyles.header}>
          <h1 className={commonStyles.title}>About MegiLance</h1>
          <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>The Future of Freelancing, Powered by AI and Web3.</p>
        </header>

        <AnimatedSection>
          <h2 className={commonStyles.sectionTitle}>Our Mission</h2>
          <p className={commonStyles.missionText}>
            Our mission is to create a transparent, efficient, and fair freelance marketplace. We leverage cutting-edge AI to match the right talent with the right projects, and utilize blockchain technology for secure, instant payments, eliminating the need for traditional intermediaries.
          </p>
        </AnimatedSection>

        <AnimatedSection>
          <h2 className={commonStyles.sectionTitle}>Our Core Values</h2>
          <div className={commonStyles.valuesGrid}>
            {values.map(value => <ValueCard key={value.title} value={value} themeStyles={themeStyles} />)}
          </div>
        </AnimatedSection>

        <AnimatedSection>
          <h2 className={commonStyles.sectionTitle}>Meet the Team</h2>
          <div className={commonStyles.teamGrid}>
            {teamMembers.map(member => <TeamMemberCard key={member.name} member={member} themeStyles={themeStyles} />)}
          </div>
        </AnimatedSection>
      </div>
    </main>
  );
};

export default About;
