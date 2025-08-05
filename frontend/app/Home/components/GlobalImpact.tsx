// @AI-HINT: Global impact section highlighting Pakistani talent and worldwide reach

'use client';

import React from 'react';
import { FaGlobe, FaFlag, FaUsers, FaChartLine, FaHeart, FaStar } from 'react-icons/fa';
import './GlobalImpact.common.css';
import './GlobalImpact.light.css';
import './GlobalImpact.dark.css';

interface GlobalImpactProps { theme?: "light" | "dark"; }
const GlobalImpact: React.FC<GlobalImpactProps> = ({ theme = "light" }) => {
  const impactStats = [
    {
      icon: FaUsers,
      number: "50,000+",
      label: "Pakistani Freelancers Empowered",
      description: "Breaking barriers and accessing global opportunities"
    },
    {
      icon: FaGlobe,
      number: "45+",
      label: "Countries Served",
      description: "Connecting talent across continents"
    },
    {
      icon: FaChartLine,
      number: "$269.8M",
      label: "Foreign Exchange Earned",
      description: "Contributing to Pakistan's digital economy"
    },
    {
      icon: FaStar,
      number: "4.9/5",
      label: "Average Project Rating",
      description: "Quality work that exceeds expectations"
    }
  ];

  const successStories = [
    {
      name: "Ayesha Khan",
      role: "UI/UX Designer",
      city: "Karachi",
      achievement: "Earned $50K+ in first year",
      quote: "MegiLance opened doors to international clients I never thought possible."
    },
    {
      name: "Muhammad Ali",
      role: "Full-Stack Developer",
      city: "Lahore",
      achievement: "Built 200+ projects",
      quote: "The AI matching system finds me perfect projects every time."
    },
    {
      name: "Fatima Ahmed",
      role: "Content Writer",
      city: "Islamabad",
      achievement: "Top 1% performer",
      quote: "Instant USDC payments changed my life. No more banking delays."
    }
  ];

  return (
    <section className={`GlobalImpact theme-${theme}`}>
      <div className="GlobalImpact-container">
        <div className="GlobalImpact-header">
          <div className="GlobalImpact-badge">
            <FaFlag className="GlobalImpact-badge-icon" />
            <span>Proudly Pakistani • Globally Connected</span>
          </div>
          <h2 className="GlobalImpact-title">
            Empowering <span className="GlobalImpact-title-highlight">Pakistani Talent</span> Worldwide
          </h2>
          <p className="GlobalImpact-subtitle">
            MegiLance is more than a platform—it's a movement. We're breaking down barriers, 
            eliminating payment friction, and connecting Pakistan's incredible talent with 
            global opportunities. Join thousands who are already transforming their careers.
          </p>
        </div>

        <div className="GlobalImpact-stats">
          {impactStats.map((stat, index) => (
            <div key={index} className="GlobalImpact-stat">
              <div className="GlobalImpact-stat-icon">
                <stat.icon />
              </div>
              <div className="GlobalImpact-stat-content">
                <div className="GlobalImpact-stat-number">{stat.number}</div>
                <div className="GlobalImpact-stat-label">{stat.label}</div>
                <div className="GlobalImpact-stat-description">{stat.description}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="GlobalImpact-mission">
          <div className="GlobalImpact-mission-content">
            <h3 className="GlobalImpact-mission-title">Our Mission</h3>
            <p className="GlobalImpact-mission-text">
              To revolutionize freelance work in Pakistan and beyond using AI for automation 
              and stable crypto for secure, accessible payments. We believe every talented 
              individual deserves access to global opportunities, regardless of their location 
              or banking infrastructure.
            </p>
            <div className="GlobalImpact-mission-features">
              <div className="GlobalImpact-mission-feature">
                <FaHeart className="GlobalImpact-mission-feature-icon" />
                <span>Built with Pakistani freelancers in mind</span>
              </div>
              <div className="GlobalImpact-mission-feature">
                <FaGlobe className="GlobalImpact-mission-feature-icon" />
                <span>Designed for global success</span>
              </div>
            </div>
          </div>
          
          <div className="GlobalImpact-world-map">
            <div className="GlobalImpact-map-container">
              <div className="GlobalImpact-map-dot GlobalImpact-map-dot--pakistan">
                <div className="GlobalImpact-map-pulse"></div>
                <span className="GlobalImpact-map-label">Pakistan</span>
              </div>
              <div className="GlobalImpact-map-dot GlobalImpact-map-dot--usa">
                <div className="GlobalImpact-map-pulse"></div>
                <span className="GlobalImpact-map-label">USA</span>
              </div>
              <div className="GlobalImpact-map-dot GlobalImpact-map-dot--uk">
                <div className="GlobalImpact-map-pulse"></div>
                <span className="GlobalImpact-map-label">UK</span>
              </div>
              <div className="GlobalImpact-map-dot GlobalImpact-map-dot--australia">
                <div className="GlobalImpact-map-pulse"></div>
                <span className="GlobalImpact-map-label">Australia</span>
              </div>
            </div>
          </div>
        </div>

        <div className="GlobalImpact-success-stories">
          <h3 className="GlobalImpact-stories-title">Success Stories from Pakistan</h3>
          <div className="GlobalImpact-stories-grid">
            {successStories.map((story, index) => (
              <div key={index} className="GlobalImpact-story">
                <div className="GlobalImpact-story-header">
                  <div className="GlobalImpact-story-avatar">
                    {story.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="GlobalImpact-story-info">
                    <div className="GlobalImpact-story-name">{story.name}</div>
                    <div className="GlobalImpact-story-role">{story.role}</div>
                    <div className="GlobalImpact-story-location">{story.city}, Pakistan</div>
                  </div>
                </div>
                <div className="GlobalImpact-story-achievement">{story.achievement}</div>
                <blockquote className="GlobalImpact-story-quote">"{story.quote}"</blockquote>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GlobalImpact;
