// @AI-HINT: Analytics and monitoring utilities for production-grade tracking
// Supports multiple providers: Google Analytics, Mixpanel, custom events

type EventProperties = Record<string, string | number | boolean | null | undefined>;

interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
  googleAnalyticsId?: string;
  mixpanelToken?: string;
}

class Analytics {
  private config: AnalyticsConfig = {
    enabled: typeof window !== 'undefined' && process.env.NODE_ENV === 'production',
    debug: process.env.NODE_ENV === 'development',
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID,
    mixpanelToken: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,
  };

  private initialized = false;

  /**
   * Initialize analytics providers
   */
  init(): void {
    if (this.initialized || typeof window === 'undefined') return;
    
    // Google Analytics 4
    if (this.config.googleAnalyticsId) {
      this.initGA4(this.config.googleAnalyticsId);
    }

    this.initialized = true;
    this.log('Analytics initialized');
  }

  /**
   * Initialize Google Analytics 4
   */
  private initGA4(measurementId: string): void {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(...args: any[]) {
      (window as any).dataLayer.push(args);
    }
    (window as any).gtag = gtag;
    gtag('js', new Date());
    gtag('config', measurementId, {
      page_title: document.title,
      page_location: window.location.href,
    });
  }

  /**
   * Track page view
   */
  pageView(path: string, title?: string): void {
    if (!this.config.enabled) return;

    // GA4
    if ((window as any).gtag) {
      (window as any).gtag('config', this.config.googleAnalyticsId, {
        page_path: path,
        page_title: title || document.title,
      });
    }

    this.log('Page view:', path);
  }

  /**
   * Track custom event
   */
  event(name: string, properties?: EventProperties): void {
    if (!this.config.enabled) return;

    // GA4
    if ((window as any).gtag) {
      (window as any).gtag('event', name, properties);
    }

    this.log('Event:', name, properties);
  }

  /**
   * Track user identification
   */
  identify(userId: string, traits?: EventProperties): void {
    if (!this.config.enabled) return;

    // GA4
    if ((window as any).gtag) {
      (window as any).gtag('set', 'user_properties', {
        user_id: userId,
        ...traits,
      });
    }

    this.log('Identify:', userId, traits);
  }

  /**
   * Track conversion/goal
   */
  conversion(name: string, value?: number, currency = 'USD'): void {
    this.event(name, {
      value,
      currency,
      conversion: true,
    });
  }

  /**
   * Track timing metrics
   */
  timing(category: string, variable: string, timeMs: number): void {
    this.event('timing_complete', {
      event_category: category,
      name: variable,
      value: timeMs,
    });
  }

  /**
   * Track errors
   */
  error(description: string, fatal = false): void {
    this.event('exception', {
      description,
      fatal,
    });
  }

  /**
   * Debug logging
   */
  private log(...args: any[]): void {
    if (this.config.debug) {
      console.log('[Analytics]', ...args);
    }
  }
}

// Singleton instance
export const analytics = new Analytics();

// Common event names
export const EVENTS = {
  // Auth events
  SIGN_UP_STARTED: 'sign_up_started',
  SIGN_UP_COMPLETED: 'sign_up_completed',
  LOGIN: 'login',
  LOGOUT: 'logout',
  
  // Project events
  PROJECT_CREATED: 'project_created',
  PROJECT_VIEWED: 'project_viewed',
  PROJECT_APPLIED: 'project_applied',
  
  // Proposal events
  PROPOSAL_SUBMITTED: 'proposal_submitted',
  PROPOSAL_ACCEPTED: 'proposal_accepted',
  PROPOSAL_REJECTED: 'proposal_rejected',
  
  // Payment events
  PAYMENT_INITIATED: 'payment_initiated',
  PAYMENT_COMPLETED: 'payment_completed',
  
  // Engagement events
  SEARCH: 'search',
  FILTER_APPLIED: 'filter_applied',
  MESSAGE_SENT: 'message_sent',
  REVIEW_SUBMITTED: 'review_submitted',
  PROFILE_UPDATED: 'profile_updated',
  
  // Feature usage
  FEATURE_USED: 'feature_used',
  AI_ASSIST_USED: 'ai_assist_used',
} as const;

export default analytics;
