import React from 'react';
import { FaUserPlus, FaClipboardList, FaHandshake, FaProjectDiagram, FaSearch, FaFileSignature } from 'react-icons/fa';
import commonStyles from './HowItWorks.common.module.css';
import lightStyles from './HowItWorks.light.module.css';
import darkStyles from './HowItWorks.dark.module.css';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

// @AI-HINT: How it works section. Now fully theme-switchable using global theme context.
const freelancerSteps = [
  { icon: <FaUserPlus />, title: 'Create Your Profile', description: 'Sign up and create a professional profile to showcase your skills and experience.' },
  { icon: <FaSearch />, title: 'Find Projects', description: 'Browse a wide range of projects and submit proposals for the ones that fit your expertise.' },
  { icon: <FaHandshake />, title: 'Collaborate & Deliver', description: 'Work directly with clients, deliver high-quality work, and get paid securely.' },
];

const clientSteps = [
  { icon: <FaClipboardList />, title: 'Post a Project', description: 'Describe your project requirements and post a job to attract top freelance talent.' },
  { icon: <FaProjectDiagram />, title: 'Hire the Right Talent', description: 'Review proposals, interview candidates, and hire the perfect freelancer for your project.' },
  { icon: <FaFileSignature />, title: 'Manage & Pay', description: 'Track project progress, communicate with your freelancer, and make secure payments upon completion.' },
];

const HowItWorks: React.FC = () => {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  return (
    <section className={cn(commonStyles.howItWorks, themeStyles.howItWorks)}>
      <div className={commonStyles.container}>
        <h2 className={commonStyles.sectionTitle}>How It Works</h2>
        <div className={commonStyles.howItWorksColumns}>
          <div className={commonStyles.column}>
            <h3 className={cn(commonStyles.columnTitle, themeStyles.columnTitle)}>For Freelancers</h3>
            <div className={commonStyles.steps}>
              {freelancerSteps.map((step, index) => (
                <div key={index} className={cn(commonStyles.stepCard, themeStyles.stepCard)}>
                  <div className={cn(commonStyles.stepIcon, themeStyles.stepIcon)}>{step.icon}</div>
                  <div className={commonStyles.stepContent}>
                    <h4 className={cn(commonStyles.stepTitle, themeStyles.stepTitle)}>{step.title}</h4>
                    <p className={cn(commonStyles.stepDescription, themeStyles.stepDescription)}>{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={commonStyles.column}>
            <h3 className={cn(commonStyles.columnTitle, themeStyles.columnTitle)}>For Clients</h3>
            <div className={commonStyles.steps}>
              {clientSteps.map((step, index) => (
                <div key={index} className={cn(commonStyles.stepCard, themeStyles.stepCard)}>
                  <div className={cn(commonStyles.stepIcon, themeStyles.stepIcon)}>{step.icon}</div>
                  <div className={commonStyles.stepContent}>
                    <h4 className={cn(commonStyles.stepTitle, themeStyles.stepTitle)}>{step.title}</h4>
                    <p className={cn(commonStyles.stepDescription, themeStyles.stepDescription)}>{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
