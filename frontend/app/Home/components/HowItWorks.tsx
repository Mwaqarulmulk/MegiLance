import React from 'react';
import { FaUserPlus, FaClipboardList, FaHandshake, FaProjectDiagram, FaSearch, FaFileSignature } from 'react-icons/fa';
import './HowItWorks.common.css';

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

interface HowItWorksProps { theme?: "light" | "dark"; }
const HowItWorks: React.FC<HowItWorksProps> = ({ theme = "light" }) => {
  return (
    <section className={`Home-how-it-works theme-${theme}`}>
      <div className="Home-container">
        <h2 className="Home-section-title">How It Works</h2>
        <div className="Home-how-it-works-columns">
          <div className="Home-how-it-works-column">
            <h3 className="Home-column-title">For Freelancers</h3>
            <div className="Home-steps">
              {freelancerSteps.map((step, index) => (
                <div key={index} className="Home-step-card">
                  <div className="Home-step-icon">{step.icon}</div>
                  <div className="Home-step-content">
                    <h4 className="Home-step-title">{step.title}</h4>
                    <p className="Home-step-description">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="Home-how-it-works-column">
            <h3 className="Home-column-title">For Clients</h3>
            <div className="Home-steps">
              {clientSteps.map((step, index) => (
                <div key={index} className="Home-step-card">
                  <div className="Home-step-icon">{step.icon}</div>
                  <div className="Home-step-content">
                    <h4 className="Home-step-title">{step.title}</h4>
                    <p className="Home-step-description">{step.description}</p>
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
