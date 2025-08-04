// @AI-HINT: This is the Home page root component. All styles are per-component only. See Home.common.css, Home.light.css, and Home.dark.css for theming.
'use client';

import React from "react";
import Link from 'next/link';
import Button from '@/app/components/Button/Button';
import { FaRocket, FaUsers, FaShieldAlt, FaChartLine, FaWallet, FaRobot } from 'react-icons/fa';
import "./Home.common.css";
import "./Home.light.css";
import "./Home.dark.css";

interface HomeProps {
  theme?: "light" | "dark";
}

const Home: React.FC<HomeProps> = ({ theme = "light" }) => {
  return (
    <div className={`Home Home--${theme}`}>
      {/* Navigation Header */}
      <header className="Home-header">
        <nav className="Home-nav">
          <div className="Home-nav-brand">
            <Link href="/" className="Home-brand-link">
              <h1 className="Home-brand">MegiLance</h1>
            </Link>
          </div>
          <div className="Home-nav-links">
            <Link href="/how-it-works" className="Home-nav-link">How It Works</Link>
            <Link href="/pricing" className="Home-nav-link">Pricing</Link>
            <Link href="/about" className="Home-nav-link">About</Link>
            <Link href="/blog" className="Home-nav-link">Blog</Link>
            <Link href="/contact" className="Home-nav-link">Contact</Link>
            <Link href="/Login" className="Home-nav-link Home-nav-link--primary">Sign In</Link>
          </div>
        </nav>
      </header>
      
      {/* Hero Section */}
      <section className="Home-hero">
        <div className="Home-hero-content">
          <h1 className="Home-title">MegiLance</h1>
          <p className="Home-tagline">Empowering Freelancers with AI and Secure USDC Payments</p>
          <p className="Home-subtitle">
            The future of freelancing is here. Connect with global clients, get paid instantly in crypto, 
            and leverage AI tools to grow your business.
          </p>
          <div className="Home-cta">
            <Link href="/Signup" className="Home-link">
              <Button theme={theme} variant="primary" size="large">
                <FaRocket /> Get Started Free
              </Button>
            </Link>
            <Link href="/Login" className="Home-link">
              <Button theme={theme} variant="secondary" size="large">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Navigation Grid */}
      <section className="Home-quick-nav">
        <div className="Home-container">
          <h2 className="Home-section-title">Explore MegiLance</h2>
          <div className="Home-quick-nav-grid">
            <Link href="/dashboard" className="Home-quick-nav-item">
              <FaChartLine className="Home-quick-nav-icon" />
              <span>Dashboard</span>
            </Link>
            <Link href="/projects" className="Home-quick-nav-item">
              <FaUsers className="Home-quick-nav-icon" />
              <span>Projects</span>
            </Link>
            <Link href="/freelancer/dashboard" className="Home-quick-nav-item">
              <FaRocket className="Home-quick-nav-icon" />
              <span>Freelancer Portal</span>
            </Link>
            <Link href="/client/dashboard" className="Home-quick-nav-item">
              <FaUsers className="Home-quick-nav-icon" />
              <span>Client Portal</span>
            </Link>
            <Link href="/ai/price-estimator" className="Home-quick-nav-item">
              <FaRobot className="Home-quick-nav-icon" />
              <span>AI Price Estimator</span>
            </Link>
            <Link href="/ai/chatbot" className="Home-quick-nav-item">
              <FaRobot className="Home-quick-nav-icon" />
              <span>AI Chatbot</span>
            </Link>
            <Link href="/payments" className="Home-quick-nav-item">
              <FaWallet className="Home-quick-nav-icon" />
              <span>Payments</span>
            </Link>
            <Link href="/messages" className="Home-quick-nav-item">
              <FaUsers className="Home-quick-nav-icon" />
              <span>Messages</span>
            </Link>
          </div>
        </div>
      </section>

      {/* All Pages Directory */}
      <section className="Home-directory">
        <div className="Home-container">
          <h2 className="Home-section-title">All Available Pages</h2>
          <div className="Home-directory-grid">
            <div className="Home-directory-section">
              <h3>Authentication</h3>
              <ul>
                <li><Link href="/Login">Login</Link></li>
                <li><Link href="/Signup">Signup</Link></li>
                <li><Link href="/forgot-password">Forgot Password</Link></li>
                <li><Link href="/onboarding">Onboarding</Link></li>
              </ul>
            </div>
            <div className="Home-directory-section">
              <h3>Main Pages</h3>
              <ul>
                <li><Link href="/dashboard">Dashboard</Link></li>
                <li><Link href="/projects">Projects</Link></li>
                <li><Link href="/messages">Messages</Link></li>
                <li><Link href="/payments">Payments</Link></li>
                <li><Link href="/profile">Profile</Link></li>
                <li><Link href="/settings">Settings</Link></li>
              </ul>
            </div>
            <div className="Home-directory-section">
              <h3>Freelancer</h3>
              <ul>
                <li><Link href="/freelancer/dashboard">Dashboard</Link></li>
                <li><Link href="/freelancer/my-jobs">My Jobs</Link></li>
                <li><Link href="/freelancer/projects">Projects</Link></li>
                <li><Link href="/freelancer/portfolio">Portfolio</Link></li>
                <li><Link href="/freelancer/analytics">Analytics</Link></li>
                <li><Link href="/freelancer/wallet">Wallet</Link></li>
                <li><Link href="/freelancer/reviews">Reviews</Link></li>
                <li><Link href="/freelancer/settings">Settings</Link></li>
              </ul>
            </div>
            <div className="Home-directory-section">
              <h3>Client</h3>
              <ul>
                <li><Link href="/client/dashboard">Dashboard</Link></li>
                <li><Link href="/client/post-job">Post Job</Link></li>
                <li><Link href="/client/hire">Hire</Link></li>
                <li><Link href="/client/projects">Projects</Link></li>
                <li><Link href="/client/reviews">Reviews</Link></li>
                <li><Link href="/client/wallet">Wallet</Link></li>
                <li><Link href="/client/settings">Settings</Link></li>
              </ul>
            </div>
            <div className="Home-directory-section">
              <h3>AI Tools</h3>
              <ul>
                <li><Link href="/ai/chatbot">AI Chatbot</Link></li>
                <li><Link href="/ai/price-estimator">Price Estimator</Link></li>
                <li><Link href="/ai/fraud-check">Fraud Check</Link></li>
              </ul>
            </div>
            <div className="Home-directory-section">
              <h3>Admin</h3>
              <ul>
                <li><Link href="/admin/dashboard">Admin Dashboard</Link></li>
                <li><Link href="/admin/users">Users</Link></li>
                <li><Link href="/admin/projects">Projects</Link></li>
                <li><Link href="/admin/payments">Payments</Link></li>
                <li><Link href="/admin/ai-monitoring">AI Monitoring</Link></li>
                <li><Link href="/admin/support">Support</Link></li>
                <li><Link href="/admin/settings">Settings</Link></li>
              </ul>
            </div>
            <div className="Home-directory-section">
              <h3>Information</h3>
              <ul>
                <li><Link href="/about">About</Link></li>
                <li><Link href="/how-it-works">How It Works</Link></li>
                <li><Link href="/pricing">Pricing</Link></li>
                <li><Link href="/blog">Blog</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/faq">FAQ</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="Home-footer">
        <div className="Home-container">
          <p>&copy; 2024 MegiLance. All rights reserved.</p>
          <div className="Home-footer-links">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/security">Security</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
