// @AI-HINT: Type declarations for optional third-party modules
// These modules are conditionally imported and may not be installed

declare module '@sentry/nextjs' {
  export function init(config: any): void;
  export function captureException(error: any, context?: any): string;
  export function captureMessage(message: string, level?: any): string;
  export function setUser(user: any): void;
  export function setTag(key: string, value: string): void;
  export function setExtra(key: string, value: any): void;
  export function withScope(callback: (scope: any) => void): void;
  export function addBreadcrumb(breadcrumb: any): void;
  export function startSpan(options: any, callback?: any): any;
  export function replayIntegration(options?: any): any;
  export function browserTracingIntegration(options?: any): any;
}

declare module 'launchdarkly-js-client-sdk' {
  export interface LDClient {
    on(event: string, callback: (...args: any[]) => void): void;
    off(event: string, callback: (...args: any[]) => void): void;
    variation(key: string, defaultValue: any): any;
    allFlags(): Record<string, any>;
    identify(context: any): Promise<void>;
    close(): Promise<void>;
    waitForInitialization(): Promise<void>;
  }
  export function initialize(clientSideId: string, context: any, options?: any): LDClient;
}

declare module 'web-vitals' {
  export interface Metric {
    name: string;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    delta: number;
    id: string;
    entries: PerformanceEntry[];
  }
  export type ReportCallback = (metric: Metric) => void;
  export function onCLS(callback: ReportCallback): void;
  export function onFID(callback: ReportCallback): void;
  export function onLCP(callback: ReportCallback): void;
  export function onFCP(callback: ReportCallback): void;
  export function onTTFB(callback: ReportCallback): void;
  export function onINP(callback: ReportCallback): void;
}

declare module '@/app/messages/components/types' {
  export interface Message {
    id: string | number;
    content: string;
    sender_id: string | number;
    created_at: string;
    [key: string]: any;
  }
}
