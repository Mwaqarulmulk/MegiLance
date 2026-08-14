// @AI-HINT: Test file for the Home page component.
// Tests that all major sections render and are present.

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: 'light' }),
}));

// Mock useThemeMode
jest.mock('@/app/hooks/useThemeMode', () => ({
  useThemeMode: () => 'light',
}));

// Mock sub-components with relative paths matching Home.tsx imports
jest.mock('./components/Hero/Hero', () => {
  return () => <div data-testid="hero-inner">Hero Section</div>;
});
jest.mock('./components/GoalSelector', () => {
  return () => <div data-testid="goal-selector">Goal Selector</div>;
});
jest.mock('./components/AIToolsHub', () => {
  return () => <div data-testid="ai-tools-hub">AI Tools Hub</div>;
});
jest.mock('./components/ToolResultShowcase', () => {
  return () => <div data-testid="tool-result-showcase">Tool Result Showcase</div>;
});
jest.mock('./components/AIResultToWork', () => {
  return () => <div data-testid="ai-result-to-work">AI Result To Work</div>;
});
jest.mock('./components/PainSolutions/PainSolutions', () => {
  return () => <div data-testid="pain-solutions">Pain Solutions</div>;
});
jest.mock('./components/TrustIndicators', () => {
  return () => <div data-testid="trust-indicators">Trust Indicators</div>;
});
jest.mock('./components/DashboardShowcase/DashboardShowcase', () => {
  return () => <div data-testid="dashboard-showcase">Dashboard Showcase</div>;
});
jest.mock('./components/HowItWorks', () => {
  return () => <div data-testid="how-it-works">How It Works Section</div>;
});
jest.mock('./components/Testimonials', () => {
  return () => <div data-testid="testimonials">Testimonials Section</div>;
});
jest.mock('./components/HomeFAQ', () => {
  return () => <div data-testid="home-faq">Home FAQ</div>;
});
jest.mock('./components/HomeFinalCTA', () => {
  return () => <div data-testid="home-final-cta">Home Final CTA</div>;
});

// Mock animation utilities from parent
jest.mock('../components/Animations/ScrollReveal', () => ({
  ScrollReveal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
jest.mock('../components/Animations/PageTransition', () => ({
  PageTransition: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
jest.mock('../components/Animations/GlobeBackground', () => {
  return () => <div data-testid="globe-background">Globe Background</div>;
});

import Home from '@/app/home/Home';

describe('Home Page Component', () => {
  test('renders major sections', () => {
    render(<Home />);
    
    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    expect(screen.getByTestId('trust-indicators')).toBeInTheDocument();
    expect(screen.getByTestId('how-it-works')).toBeInTheDocument();
  });

  test('renders page with theme-aware structure', () => {
    render(<Home />);
    // Verify the page renders without crashing (theme-dependent rendering)
    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
  });
});
