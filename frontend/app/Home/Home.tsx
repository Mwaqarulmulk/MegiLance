// @AI-HINT: This is the comprehensive Home page showcasing MegiLance's AI-powered freelancing platform with blockchain integration. Maximum scope implementation with premium sections.
'use client';

import React from "react";
import Link from 'next/link';
import Button from '@/app/components/Button/Button';
import { FaRocket, FaUsers, FaShieldAlt } from 'react-icons/fa';
import Hero from './components/Hero';
import Features from './components/Features';
import AIShowcase from './components/AIShowcase';
import BlockchainShowcase from './components/BlockchainShowcase';
import HowItWorks from './components/HowItWorks';
import GlobalImpact from './components/GlobalImpact';
import Testimonials from './components/Testimonials';
import CTA from './components/CTA';
import "./Home.common.css";
import "./Home.light.css";
import "./Home.dark.css";
import "./components/Hero.common.css";
import "./components/Hero.light.css";
import "./components/Hero.dark.css";
import "./components/Features.common.css";
import "./components/Features.light.css";
import "./components/Features.dark.css";
import "./components/AIShowcase.common.css";
import "./components/AIShowcase.light.css";
import "./components/AIShowcase.dark.css";
import "./components/BlockchainShowcase.common.css";
import "./components/BlockchainShowcase.light.css";
import "./components/BlockchainShowcase.dark.css";
import "./components/HowItWorks.common.css";
import "./components/HowItWorks.light.css";
import "./components/HowItWorks.dark.css";
import "./components/GlobalImpact.common.css";
import "./components/GlobalImpact.light.css";
import "./components/GlobalImpact.dark.css";
import "./components/Testimonials.common.css";
import "./components/Testimonials.light.css";
import "./components/Testimonials.dark.css";
import "./components/CTA.common.css";
import "./components/CTA.light.css";
import "./components/CTA.dark.css";

import { useTheme } from '@/app/contexts/ThemeContext';

const Home: React.FC = () => {
  const { theme } = useTheme();
  return (
    <div className={`Home theme-${theme}`}>
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
      
      {/* Enhanced Hero Section with Animated Stats */}
      <Hero theme={theme} />

      {/* Core Platform Features */}
      <Features theme={theme} />
      
      {/* AI-Powered Capabilities Showcase */}
      <AIShowcase theme={theme} />
      
      {/* Blockchain & Crypto Payment Features */}
      <BlockchainShowcase theme={theme} />
      
      {/* How the Platform Works */}
      <HowItWorks theme={theme} />
      
      {/* Global Impact & Pakistani Focus */}
      <GlobalImpact theme={theme} />
      
      {/* User Testimonials */}
      <Testimonials theme={theme} />
      
      {/* Final Call-to-Action */}
      <CTA theme={theme} />

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
