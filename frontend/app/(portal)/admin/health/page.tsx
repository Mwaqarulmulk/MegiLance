// @AI-HINT: Admin System Health monitoring page
'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import Button from '@/app/components/atoms/Button/Button';
import Loading from '@/app/components/atoms/Loading/Loading';
import { Activity, CheckCircle, AlertTriangle, XCircle, RefreshCw, Database, Server, Mail, HardDrive, Cpu } from 'lucide-react'
import { apiFetch } from '@/lib/api/core';

import commonStyles from './Health.common.module.css';
import lightStyles from './Health.light.module.css';
import darkStyles from './Health.dark.module.css';

interface ServiceHealth {
  name: string;
  healthy: boolean;
  message: string;
  response_time_ms: number;
}

interface StatusData {
  timestamp: string;
  system_status: 'healthy' | 'degraded' | 'offline';
  version: string;
  environment: string;
  uptime: {
    seconds: number;
    display: string;
  };
  services: {
    database: ServiceHealth;
    llm_gateway: ServiceHealth;
    storage: ServiceHealth;
    email: ServiceHealth;
  };
  summary: {
    critical_services_healthy: boolean;
    ai_services_available: boolean;
    storage_available: boolean;
    email_available: boolean;
    total_endpoints: number;
    ai_endpoints_count: number;
    public_tools_count: number;
    chatbot_endpoints_count: number;
    core_endpoints_count: number;
  };
}

export default function AdminHealthPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const data = await apiFetch<StatusData>('/status/full');
      setStatus(data);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Health check failed:', err);
      }
      setError(err instanceof Error ? err.message : 'Failed to fetch health status');
      setStatus(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const themeStyles = mounted && resolvedTheme === 'dark' ? darkStyles : lightStyles;

  const getStatusIcon = (healthy: boolean) => {
    return healthy ? <CheckCircle size={20} className={commonStyles.iconHealthy} /> :
      <XCircle size={20} className={commonStyles.iconDown} />;
  };

  const getServiceIcon = (serviceName: string) => {
    switch (serviceName.toLowerCase()) {
      case 'database (turso)': return <Database size={20} />;
      case 'llm gateway': return <Cpu size={20} />;
      case 'file storage': return <HardDrive size={20} />;
      case 'file storage (s3/r2)': return <HardDrive size={20} />;
      case 'file storage (local)': return <HardDrive size={20} />;
      case 'email service': return <Mail size={20} />;
      case 'email service (resend)': return <Mail size={20} />;
      case 'email service (smtp)': return <Mail size={20} />;
      default: return <Server size={20} />;
    }
  };

  if (!mounted) return <Loading />;

  const overallStatus = status?.system_status || 'offline';
  const services = status?.services ? Object.values(status.services) : [];
  const healthyCount = services.filter(s => s.healthy).length;

  return (
    <div className={cn(commonStyles.container, themeStyles.container)}>
      <div className={commonStyles.header}>
        <div>
          <h1 className={cn(commonStyles.title, themeStyles.title)}>System Health</h1>
          <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>
            Monitor platform services and performance
          </p>
        </div>
        <Button variant="outline" iconBefore={<RefreshCw size={18} className={refreshing ? commonStyles.spinning : ''} />} onClick={fetchHealth} isLoading={refreshing}>
          Refresh
        </Button>
      </div>

      {/* Overall Status */}
      <div className={cn(commonStyles.overallStatus, commonStyles[`overall${overallStatus}`], themeStyles.overallStatus)}>
        {getStatusIcon(overallStatus === 'healthy')}
        <div>
          <h3>System Status: {overallStatus.charAt(0).toUpperCase() + overallStatus.slice(1)}</h3>
          <p>All {healthyCount} of {services.length} services operational</p>
        </div>
      </div>

      {/* System Info */}
      {status && (
        <div className={cn(commonStyles.servicesGrid, themeStyles.servicesGrid)} style={{ marginBottom: '20px' }}>
          <div className={cn(commonStyles.serviceCard, themeStyles.serviceCard)}>
            <div className={commonStyles.serviceHeader}>
              <Server size={20} />
              <h3>Version</h3>
            </div>
            <div className={commonStyles.serviceStats}>
              <div className={commonStyles.stat}>
                <span className={cn(commonStyles.statValue, themeStyles.statValue)}>v{status.version}</span>
              </div>
            </div>
          </div>
          <div className={cn(commonStyles.serviceCard, themeStyles.serviceCard)}>
            <div className={commonStyles.serviceHeader}>
              <Activity size={20} />
              <h3>Environment</h3>
            </div>
            <div className={commonStyles.serviceStats}>
              <div className={commonStyles.stat}>
                <span className={cn(commonStyles.statValue, themeStyles.statValue)}>{status.environment}</span>
              </div>
            </div>
          </div>
          <div className={cn(commonStyles.serviceCard, themeStyles.serviceCard)}>
            <div className={commonStyles.serviceHeader}>
              <Activity size={20} />
              <h3>Uptime</h3>
            </div>
            <div className={commonStyles.serviceStats}>
              <div className={commonStyles.stat}>
                <span className={cn(commonStyles.statValue, themeStyles.statValue)}>{status.uptime?.display || 'N/A'}</span>
              </div>
            </div>
          </div>
          <div className={cn(commonStyles.serviceCard, themeStyles.serviceCard)}>
            <div className={commonStyles.serviceHeader}>
              <Activity size={20} />
              <h3>Total Endpoints</h3>
            </div>
            <div className={commonStyles.serviceStats}>
              <div className={commonStyles.stat}>
                <span className={cn(commonStyles.statValue, themeStyles.statValue)}>{status.summary.total_endpoints}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <Loading />
      ) : error ? (
        <div className={cn(commonStyles.serviceCard, themeStyles.serviceCard)}>
          <p>Error: {error}</p>
          <Button variant="outline" onClick={fetchHealth}>Retry</Button>
        </div>
      ) : (
        <div className={commonStyles.servicesGrid}>
          {services.map((service, index) => (
            <div key={index} className={cn(commonStyles.serviceCard, themeStyles.serviceCard)}>
              <div className={commonStyles.serviceHeader}>
                {getServiceIcon(service.name)}
                <h3>{service.name}</h3>
              </div>
              <div className={commonStyles.serviceStats}>
                <div className={commonStyles.stat}>
                  <span className={commonStyles.statLabel}>Status</span>
                  <span className={cn(commonStyles.statValue, themeStyles.statValue, service.healthy ? commonStyles.iconHealthy : commonStyles.iconDown)}>
                    {service.healthy ? 'Healthy' : 'Unhealthy'}
                  </span>
                </div>
                {service.response_time_ms > 0 && (
                  <div className={commonStyles.stat}>
                    <span className={commonStyles.statLabel}>Latency</span>
                    <span className={cn(commonStyles.statValue, themeStyles.statValue)}>{service.response_time_ms}ms</span>
                  </div>
                )}
              </div>
              <p className={commonStyles.lastCheck}>{service.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Endpoint Summary */}
      {status && (
        <div className={cn(commonStyles.serviceCard, themeStyles.serviceCard)} style={{ marginTop: '20px' }}>
          <h3>Endpoint Categories</h3>
          <div className={commonStyles.serviceStats}>
            <div className={commonStyles.stat}>
              <span className={commonStyles.statLabel}>AI Services</span>
              <span className={cn(commonStyles.statValue, themeStyles.statValue)}>{status.summary.ai_endpoints_count}</span>
            </div>
            <div className={commonStyles.stat}>
              <span className={commonStyles.statLabel}>Public Tools</span>
              <span className={cn(commonStyles.statValue, themeStyles.statValue)}>{status.summary.public_tools_count}</span>
            </div>
            <div className={commonStyles.stat}>
              <span className={commonStyles.statLabel}>Chatbot</span>
              <span className={cn(commonStyles.statValue, themeStyles.statValue)}>{status.summary.chatbot_endpoints_count}</span>
            </div>
            <div className={commonStyles.stat}>
              <span className={commonStyles.statLabel}>Core API</span>
              <span className={cn(commonStyles.statValue, themeStyles.statValue)}>{status.summary.core_endpoints_count}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
