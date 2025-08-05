import React from 'react';
import { FaRocket, FaShieldAlt, FaRobot, FaWallet } from 'react-icons/fa';
import './Features.common.css';

const features = [
  {
    icon: <FaRobot />,
    title: 'AI-Powered Tools',
    description: 'Leverage our suite of AI tools to estimate project costs, generate proposals, and automate your workflow.',
  },
  {
    icon: <FaShieldAlt />,
    title: 'Secure Crypto Payments',
    description: 'Get paid instantly and securely in USDC with our transparent, low-fee payment system.',
  },
  {
    icon: <FaRocket />,
    title: 'Global Opportunities',
    description: 'Connect with a global network of clients and find projects that match your skills and passion.',
  },
  {
    icon: <FaWallet />,
    title: 'Integrated Wallet',
    description: 'Manage your earnings with a built-in, secure wallet that gives you full control over your funds.',
  },
];

interface FeaturesProps { theme?: "light" | "dark"; }
const Features: React.FC<FeaturesProps> = ({ theme = "light" }) => {
  return (
    <section className={`Home-features theme-${theme}`}>
      <div className="Home-container">
        <h2 className="Home-section-title">Why Choose MegiLance?</h2>
        <p className="Home-section-subtitle">The platform designed for the future of freelancing.</p>
        <div className="Home-features-grid">
          {features.map((feature, index) => (
            <div key={index} className="Home-feature-card">
              <div className="Home-feature-icon">{feature.icon}</div>
              <h3 className="Home-feature-title">{feature.title}</h3>
              <p className="Home-feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
