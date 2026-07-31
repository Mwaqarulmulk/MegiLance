// @AI-HINT: Careers page with accessible main landmark, labeled sections, theme-aware styles, and comprehensive job listings.
'use client';
import React from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { PageTransition } from '@/app/components/Animations/PageTransition';
import { ScrollReveal } from '@/app/components/Animations/ScrollReveal';
import { StaggerContainer, StaggerItem } from '@/app/components/Animations/StaggerContainer';
import { AnimatedOrb, ParticlesSystem, FloatingCube, FloatingSphere } from '@/app/components/3D';
import { 
  MapPin, 
  Clock, 
  Zap, 
  Heart, 
  Shield, 
  Users, 
  Globe, 
  Coffee, 
  GraduationCap,
  Briefcase,
  Code,
  TrendingUp
} from 'lucide-react';
import common from './Careers.common.module.css';
import light from './Careers.light.module.css';
import dark from './Careers.dark.module.css';

const roles = [
  { 
    id: 'fe-lead', 
    title: 'Senior Frontend Engineer', 
    location: 'Remote', 
    type: 'Full-time',
    department: 'Engineering',
    icon: Code,
    description: 'Build beautiful, performant interfaces using Next.js 16, TypeScript, and modern React patterns.'
  },
  { 
    id: 'be-eng', 
    title: 'Backend Engineer (Python / FastAPI)', 
    location: 'Remote', 
    type: 'Full-time',
    department: 'Engineering',
    icon: Code,
    description: 'Design and scale our FastAPI backend services, Turso edge connection pooling, and AI matching systems.'
  },
  { 
    id: 'ml-eng', 
    title: 'Machine Learning Engineer', 
    location: 'Remote', 
    type: 'Full-time',
    department: 'AI/ML',
    icon: TrendingUp,
    description: 'Improve our 7-factor AI matching algorithm, sentiment evaluation models, and talent ranking scores.'
  },
  {
    id: 'ui-ux',
    title: 'Lead Product & UX Designer',
    location: 'Remote',
    type: 'Full-time',
    department: 'Design',
    icon: Heart,
    description: 'Craft intuitive portal dashboards, mobile-responsive workflows, and accessible design system components.'
  },
  {
    id: 'sec-eng',
    title: 'Smart Contract & Security Lead',
    location: 'Remote',
    type: 'Full-time',
    department: 'Engineering',
    icon: Shield,
    description: 'Audit smart contract escrow functions, manage zero-knowledge identity protocols, and lead compliance verification.'
  }
];

const benefits = [
  { icon: Globe, title: '100% Remote', description: 'Work from anywhere in the world' },
  { icon: Clock, title: 'Flexible Hours', description: 'Set your own schedule' },
  { icon: Heart, title: 'Health Benefits', description: 'Comprehensive medical, dental & vision' },
  { icon: Coffee, title: 'Home Office Stipend', description: '$500 setup + $100/month' },
  { icon: GraduationCap, title: 'Learning Budget', description: '$1,000/year for courses & conferences' },
  { icon: Users, title: 'Team Retreats', description: 'Annual in-person gatherings' },
];

const values = [
  { 
    icon: Zap, 
    title: 'Quality with Taste', 
    description: 'We build production-ready products that delight users with attention to every detail.'
  },
  { 
    icon: Shield, 
    title: 'Security & Trust', 
    description: 'We protect our users and their data with enterprise-level security practices.'
  },
  { 
    icon: TrendingUp, 
    title: 'Velocity with Care', 
    description: 'We move fast but never sacrifice quality. Every line of code matters.'
  },
];

const Careers: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const themed = resolvedTheme === 'dark' ? dark : light;
  const [selectedDept, setSelectedDept] = React.useState<string>('All');

  const departments = ['All', 'Engineering', 'AI/ML', 'Design'];
  const filteredRoles = selectedDept === 'All' 
    ? roles 
    : roles.filter(r => r.department === selectedDept);

  return (
    <PageTransition>
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
         <AnimatedOrb variant="purple" size={500} blur={90} opacity={0.1} className="absolute top-[-10%] right-[-10%]" />
         <AnimatedOrb variant="blue" size={400} blur={70} opacity={0.08} className="absolute bottom-[-10%] left-[-10%]" />
         <ParticlesSystem count={12} className="absolute inset-0" />
         <div className="absolute top-20 left-10 opacity-10 animate-float-slow">
           <FloatingCube size={40} />
         </div>
         <div className="absolute bottom-40 right-20 opacity-10 animate-float-medium">
           <FloatingSphere size={30} variant="gradient" />
         </div>
      </div>

      <main id="main-content" role="main" aria-labelledby="careers-title" className={cn(common.page, themed.themeWrapper)}>
        <div className={common.container}>
          <ScrollReveal>
            <header className={common.header}>
              <span className={common.badge}>Join the Team</span>
              <h1 id="careers-title" className={common.title}>Careers at MegiLance</h1>
              <p className={common.subtitle}>Help us build the future of freelancing. Join a remote-first team passionate about connecting talent with opportunity.</p>
            </header>
          </ScrollReveal>

          {/* Values Section */}
          <section aria-labelledby="values-heading" className={common.section}>
            <ScrollReveal>
              <h2 id="values-heading" className={common.sectionTitle}>Our Values</h2>
            </ScrollReveal>
            <StaggerContainer className={common.valuesGrid}>
              {values.map((value, idx) => (
                <StaggerItem key={idx} className={common.valueCard}>
                  <div className={common.valueIcon}>
                    <value.icon size={24} />
                  </div>
                  <h3 className={common.valueTitle}>{value.title}</h3>
                  <p className={common.valueDesc}>{value.description}</p>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>

          {/* Open Roles Section */}
          <section aria-labelledby="open-roles-heading" className={common.section}>
            <ScrollReveal>
              <h2 id="open-roles-heading" className={common.sectionTitle}>
                <Briefcase size={24} className="inline mr-2" />
                Open Positions ({filteredRoles.length})
              </h2>

              {/* Department Filter Pills */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '1rem 0 2rem' }}>
                {departments.map(dept => (
                  <button
                    key={dept}
                    onClick={() => setSelectedDept(dept)}
                    style={{
                      padding: '0.4rem 1rem',
                      borderRadius: '999px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: '1px solid var(--color-primary, #4573df)',
                      background: selectedDept === dept ? 'var(--color-primary, #4573df)' : 'transparent',
                      color: selectedDept === dept ? '#ffffff' : 'inherit',
                      transition: 'all 0.2s ease',
                    }}
                    aria-label={`Filter by ${dept} department`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </ScrollReveal>
            <StaggerContainer className={common.roles}>
              {filteredRoles.map((r) => (
                <StaggerItem key={r.id} className={common.roleCard} aria-labelledby={`role-${r.id}-title`}>
                  <div className={common.roleHeader}>
                    <div className={common.roleIcon}>
                      <r.icon size={20} />
                    </div>
                    <span className={common.roleDept}>{r.department}</span>
                  </div>
                  <h3 id={`role-${r.id}-title`} className={common.roleTitle}>{r.title}</h3>
                  <p className={common.roleDesc}>{r.description}</p>
                  <div className={common.roleMeta}>
                    <span className={common.roleMetaItem}>
                      <MapPin size={14} />
                      {r.location}
                    </span>
                    <span className={common.roleMetaItem}>
                      <Clock size={14} />
                      {r.type}
                    </span>
                  </div>
                  <a className={cn(common.button, common.applyButton)} href={`mailto:careers@megilance.com?subject=Application: ${r.title}`} aria-label={`Apply for ${r.title}`}>
                    Apply Now
                  </a>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>

          {/* Benefits Section */}
          <section aria-labelledby="benefits-heading" className={common.section}>
            <ScrollReveal>
              <h2 id="benefits-heading" className={common.sectionTitle}>
                <Heart size={24} className="inline mr-2" />
                Benefits & Perks
              </h2>
            </ScrollReveal>
            <StaggerContainer className={common.benefitsGrid}>
              {benefits.map((benefit, idx) => (
                <StaggerItem key={idx} className={common.benefitCard}>
                  <benefit.icon size={28} className={common.benefitIcon} />
                  <h3 className={common.benefitTitle}>{benefit.title}</h3>
                  <p className={common.benefitDesc}>{benefit.description}</p>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>

          {/* CTA Section */}
          <section className={common.section}>
            <ScrollReveal>
              <div className={common.ctaCard}>
                <h2 className={common.ctaTitle}>Don't see a role that fits?</h2>
                <p className={common.ctaDesc}>We're always looking for exceptional talent. Send us your resume and let's talk!</p>
                <a className={cn(common.button, common.ctaButton)} href="mailto:careers@megilance.com">
                  Send Your Resume
                </a>
              </div>
            </ScrollReveal>
          </section>
        </div>
      </main>
    </PageTransition>
  );
};

export default Careers;
