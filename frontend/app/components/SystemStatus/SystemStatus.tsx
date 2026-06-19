'use client';

import { useEffect, useState } from 'react';
import styles from './SystemStatus.common.module.css';

interface ServiceHealth {
  name: string;
  healthy: boolean;
  message: string;
  response_time_ms: number;
}

interface Endpoint {
  endpoint: string;
  method: string;
  auth: boolean;
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
  endpoints: {
    ai_services: Endpoint[];
    public_tools: Endpoint[];
    chatbot: Endpoint[];
    core: Endpoint[];
  };
  api_documentation: string;
  health_check: string;
}

export default function SystemStatus() {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'services' | 'ai' | 'tools' | 'chatbot' | 'core'>('services');

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/v1/status/full');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        setStatus(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch status');
        setStatus(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading system status...</p>
        </div>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <h2>Unable to Load System Status</h2>
          <p>{error || 'No data received'}</p>
          <button onClick={() => window.location.reload()} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (healthy: boolean) => {
    return healthy ? styles.statusHealthy : styles.statusUnhealthy;
  };

  const getStatusIcon = (healthy: boolean) => {
    return healthy ? '✓' : '✗';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>System Status & API Health</h1>
        <p className={styles.timestamp}>Last updated: {new Date(status.timestamp).toLocaleTimeString()}</p>
      </div>

      {/* Overall Status */}
      <div className={`${styles.card} ${styles[`status${status.system_status}`]}`}>
        <div className={styles.statusBadge}>
          <span className={styles.statusIcon}>{getStatusIcon(status.system_status !== 'offline')}</span>
          <span className={styles.statusText}>
            System: <strong>{status.system_status.toUpperCase()}</strong>
          </span>
        </div>
        <p className={styles.statusDescription}>
          {status.system_status === 'healthy' && 'All services are operational'}
          {status.system_status === 'degraded' && 'Some services are experiencing issues'}
          {status.system_status === 'offline' && 'Services are unavailable'}
        </p>
      </div>

      {/* System Info */}
      <div className={styles.summary}>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Version</span>
          <span className={styles.statValue}>v{status.version}</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Environment</span>
          <span className={styles.statValue}>{status.environment}</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Uptime</span>
          <span className={styles.statValue}>{status.uptime?.display || 'N/A'}</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Total Endpoints</span>
          <span className={styles.statValue}>{status.summary.total_endpoints}</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>AI Services</span>
          <span className={styles.statValue}>{status.summary.ai_endpoints_count}</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Public Tools</span>
          <span className={styles.statValue}>{status.summary.public_tools_count}</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Chatbot</span>
          <span className={styles.statValue}>{status.summary.chatbot_endpoints_count}</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Core API</span>
          <span className={styles.statValue}>{status.summary.core_endpoints_count}</span>
        </div>
      </div>

      {/* Services Health */}
      <div className={styles.card}>
        <h2>Services Health</h2>
        <div className={styles.servicesList}>
          {Object.entries(status.services).map(([key, service]) => (
            <div key={key} className={styles.serviceItem}>
              <div className={`${styles.serviceStatus} ${getStatusColor(service.healthy)}`}>
                <span className={styles.serviceIcon}>{getStatusIcon(service.healthy)}</span>
                <div className={styles.serviceInfo}>
                  <h3>{service.name}</h3>
                  <p>{service.message}</p>
                  {service.response_time_ms > 0 && (
                    <small>{service.response_time_ms.toFixed(2)}ms</small>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs for Different Endpoint Categories */}
      <div className={styles.card}>
        <h2>API Endpoints</h2>
        <div className={styles.tabsContainer}>
          <button
            className={`${styles.tab} ${activeTab === 'services' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('services')}
          >
            AI Services ({status.summary.ai_endpoints_count})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'tools' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('tools')}
          >
            Public Tools ({status.summary.public_tools_count})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'chatbot' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('chatbot')}
          >
            Chatbot ({status.summary.chatbot_endpoints_count})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'core' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('core')}
          >
            Core API ({status.summary.core_endpoints_count})
          </button>
        </div>

        <div className={styles.endpointsList}>
          {activeTab === 'services' && (
            <>
              {status.endpoints.ai_services.map((endpoint, idx) => (
                <div key={idx} className={styles.endpointItem}>
                  <span className={`${styles.method} ${styles[`method${endpoint.method}`]}`}>
                    {endpoint.method}
                  </span>
                  <span className={styles.path}>{endpoint.endpoint}</span>
                  <span className={styles.auth}>{endpoint.auth ? '🔒' : '🌐'}</span>
                </div>
              ))}
            </>
          )}

          {activeTab === 'tools' && (
            <>
              {status.endpoints.public_tools.map((endpoint, idx) => (
                <div key={idx} className={styles.endpointItem}>
                  <span className={`${styles.method} ${styles[`method${endpoint.method}`]}`}>
                    {endpoint.method}
                  </span>
                  <span className={styles.path}>{endpoint.endpoint}</span>
                  <span className={styles.auth}>{endpoint.auth ? '🔒' : '🌐'}</span>
                </div>
              ))}
            </>
          )}

          {activeTab === 'chatbot' && (
            <>
              {status.endpoints.chatbot.map((endpoint, idx) => (
                <div key={idx} className={styles.endpointItem}>
                  <span className={`${styles.method} ${styles[`method${endpoint.method}`]}`}>
                    {endpoint.method}
                  </span>
                  <span className={styles.path}>{endpoint.endpoint}</span>
                  <span className={styles.auth}>{endpoint.auth ? '🔒' : '🌐'}</span>
                </div>
              ))}
            </>
          )}

          {activeTab === 'core' && (
            <>
              {status.endpoints.core.map((endpoint, idx) => (
                <div key={idx} className={styles.endpointItem}>
                  <span className={`${styles.method} ${styles[`method${endpoint.method}`]}`}>
                    {endpoint.method}
                  </span>
                  <span className={styles.path}>{endpoint.endpoint}</span>
                  <span className={styles.auth}>{endpoint.auth ? '🔒' : '🌐'}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Documentation Links */}
      <div className={styles.card}>
        <h2>Documentation</h2>
        <p>
          View the full API documentation at{' '}
          <a href={status.api_documentation} target="_blank" rel="noopener noreferrer">
            {status.api_documentation}
          </a>
        </p>
        <p>
          Quick health check:{' '}
          <code>
            <a href={`/api${status.health_check}`} target="_blank" rel="noopener noreferrer">
              /api{status.health_check}
            </a>
          </code>
        </p>
      </div>
    </div>
  );
}
