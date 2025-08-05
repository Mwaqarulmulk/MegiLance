// @AI-HINT: AI-powered features showcase section highlighting intelligent automation

'use client';

import React from 'react';
import { FaRobot, FaBrain, FaChartLine, FaShieldAlt, FaComments, FaDollarSign } from 'react-icons/fa';
import './AIShowcase.common.css';
import './AIShowcase.light.css';
import './AIShowcase.dark.css';

interface AIShowcaseProps { theme?: "light" | "dark"; }
const AIShowcase: React.FC<AIShowcaseProps> = ({ theme = "light" }) => {
  const aiFeatures = [
    {
      icon: FaBrain,
      title: "Smart Job Matching",
      description: "Our AI analyzes your skills, experience, and preferences to match you with the perfect projects automatically.",
      stats: "97% Match Accuracy"
    },
    {
      icon: FaDollarSign,
      title: "AI Price Forecasting",
      description: "Get intelligent pricing recommendations based on market trends, project complexity, and your expertise level.",
      stats: "15% Higher Earnings"
    },
    {
      icon: FaShieldAlt,
      title: "Fraud Detection",
      description: "Advanced ML algorithms protect you from scams and identify suspicious activities in real-time.",
      stats: "99.9% Security Rate"
    },
    {
      icon: FaComments,
      title: "AI Chatbot Support",
      description: "24/7 intelligent assistance for platform guidance, dispute resolution, and technical support.",
      stats: "< 30s Response Time"
    },
    {
      icon: FaChartLine,
      title: "Performance Analytics",
      description: "AI-powered insights help you optimize your profile, improve your rankings, and grow your business.",
      stats: "3x Faster Growth"
    },
    {
      icon: FaRobot,
      title: "Automated Workflows",
      description: "Smart automation handles routine tasks like invoicing, follow-ups, and project updates.",
      stats: "80% Time Saved"
    }
  ];

  return (
    <section className={`AIShowcase theme-${theme}`}>
      <div className="AIShowcase-container">
        <div className="AIShowcase-header">
          <div className="AIShowcase-badge">
            <FaRobot className="AIShowcase-badge-icon" />
            <span>Powered by Advanced AI</span>
          </div>
          <h2 className="AIShowcase-title">
            Artificial Intelligence That <span className="AIShowcase-title-highlight">Works for You</span>
          </h2>
          <p className="AIShowcase-subtitle">
            Experience the future of freelancing with cutting-edge AI technology that automates the mundane 
            and amplifies your potential. Our machine learning models are trained on millions of successful 
            freelance interactions.
          </p>
        </div>

        <div className="AIShowcase-grid">
          {aiFeatures.map((feature, index) => (
            <div key={index} className="AIShowcase-card">
              <div className="AIShowcase-card-header">
                <div className="AIShowcase-card-icon">
                  <feature.icon />
                </div>
                <div className="AIShowcase-card-stats">{feature.stats}</div>
              </div>
              <h3 className="AIShowcase-card-title">{feature.title}</h3>
              <p className="AIShowcase-card-description">{feature.description}</p>
              <div className="AIShowcase-card-footer">
                <div className="AIShowcase-card-glow"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="AIShowcase-tech-stack">
          <h3 className="AIShowcase-tech-title">Powered by Industry-Leading Technology</h3>
          <div className="AIShowcase-tech-logos">
            <div className="AIShowcase-tech-logo">TensorFlow</div>
            <div className="AIShowcase-tech-logo">OpenAI GPT</div>
            <div className="AIShowcase-tech-logo">PyTorch</div>
            <div className="AIShowcase-tech-logo">Scikit-learn</div>
            <div className="AIShowcase-tech-logo">Hugging Face</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIShowcase;
