// @AI-HINT: Premium Analytics page with interactive, dependency-free SVG charts and time-range controls.

'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Card from '@/app/components/Card/Card';
import styles from './Analytics.module.css';
import Skeleton from '@/app/components/Animations/Skeleton/Skeleton';

type RangeKey = '7d' | '30d' | '90d' | '12m';

const AnalyticsPage = () => {
  // AI-HINT: Mock aggregates. Replace with real API when backend is ready.
  const analyticsData = {
    totalEarnings: 75250.5,
    projectsCompleted: 23,
    clientSatisfaction: 4.9,
    avgResponseTime: '2 hours',
  };

  const [range, setRange] = useState<RangeKey>('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // AI-HINT: Demo loading to showcase Skeletons. Replace with real fetch.
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  // AI-HINT: Generate deterministic mock series based on selected range.
  const series = useMemo(() => {
    const seed = { '7d': 7, '30d': 30, '90d': 90, '12m': 12 }[range];
    const pts: { x: number; y: number }[] = [];
    const base = range === '12m' ? 5000 : 400;
    for (let i = 0; i < seed; i++) {
      // simple pseudo-random but smooth-ish values
      const noise = Math.sin(i * 0.7) * (range === '12m' ? 600 : 60) + (Math.cos(i * 0.33) * (range === '12m' ? 300 : 25));
      const y = Math.max(0, base + i * (range === '12m' ? 150 : 10) + noise);
      pts.push({ x: i, y });
    }
    return pts;
  }, [range]);

  // Basic scales
  const { width, height, padding } = { width: 800, height: 260, padding: 32 };
  const xMax = series.length - 1 || 1;
  const yMax = series.reduce((m, d) => Math.max(m, d.y), 1);
  const yMin = 0;
  const xScale = useCallback((x: number) => padding + (x / xMax) * (width - padding * 2), [padding, xMax, width]);
  const yScale = useCallback((y: number) => height - padding - ((y - yMin) / (yMax - yMin || 1)) * (height - padding * 2), [height, padding, yMin, yMax]);

  const lineD = useMemo(() => {
    if (!series.length) return '';
    return series
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(d.x).toFixed(2)} ${yScale(d.y).toFixed(2)}`)
      .join(' ');
  }, [series, xScale, yScale]);

  const areaD = useMemo(() => {
    if (!series.length) return '';
    const top = series.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(d.x).toFixed(2)} ${yScale(d.y).toFixed(2)}`).join(' ');
    const bottom = `L ${xScale(series[series.length - 1].x).toFixed(2)} ${yScale(0).toFixed(2)} L ${xScale(series[0].x).toFixed(2)} ${yScale(0).toFixed(2)} Z`;
    return `${top} ${bottom}`;
  }, [series, xScale, yScale]);

  return (
    <div>
      <h1 className={styles.pageHeader}>Performance Analytics</h1>
      <div className={styles.analyticsGrid}>
        <Card title="Total Earnings">
          {loading ? (
            <>
              <Skeleton height={28} width={'60%'} />
              <div className={styles.skeletonSpacerSm}>
                <Skeleton height={14} width={'40%'} />
              </div>
            </>
          ) : (
            <>
              <p className={styles.statValue}>{formatCurrency(analyticsData.totalEarnings)}</p>
              <p className={styles.statLabel}>All time</p>
            </>
          )}
        </Card>
        <Card title="Projects Completed">
          {loading ? (
            <>
              <Skeleton height={28} width={'40%'} />
              <div className={styles.skeletonSpacerSm}>
                <Skeleton height={14} width={'30%'} />
              </div>
            </>
          ) : (
            <>
              <p className={styles.statValue}>{analyticsData.projectsCompleted}</p>
              <p className={styles.statLabel}>All time</p>
            </>
          )}
        </Card>
        <Card title="Client Satisfaction">
          {loading ? (
            <>
              <Skeleton height={28} width={'50%'} />
              <div className={styles.skeletonSpacerSm}>
                <Skeleton height={14} width={'60%'} />
              </div>
            </>
          ) : (
            <>
              <p className={styles.statValue}>{analyticsData.clientSatisfaction} / 5.0</p>
              <p className={styles.statLabel}>Based on 18 reviews</p>
            </>
          )}
        </Card>
        <Card title="Avg. Response Time">
          {loading ? (
            <>
              <Skeleton height={28} width={'35%'} />
              <div className={styles.skeletonSpacerSm}>
                <Skeleton height={14} width={'50%'} />
              </div>
            </>
          ) : (
            <>
              <p className={styles.statValue}>{analyticsData.avgResponseTime}</p>
              <p className={styles.statLabel}>Last 30 days</p>
            </>
          )}
        </Card>

        <div className={styles.mainChartContainer}>
          <Card title="Earnings Over Time">
            <div className={styles.controlsBar}>
              <div className={styles.controlsLeft}>
                <button
                  className={`${styles.rangeButton} ${range === '7d' ? styles.rangeButtonActive : ''}`}
                  onClick={() => setRange('7d')}
                >
                  7d
                </button>
                <button
                  className={`${styles.rangeButton} ${range === '30d' ? styles.rangeButtonActive : ''}`}
                  onClick={() => setRange('30d')}
                >
                  30d
                </button>
                <button
                  className={`${styles.rangeButton} ${range === '90d' ? styles.rangeButtonActive : ''}`}
                  onClick={() => setRange('90d')}
                >
                  90d
                </button>
                <button
                  className={`${styles.rangeButton} ${range === '12m' ? styles.rangeButtonActive : ''}`}
                  onClick={() => setRange('12m')}
                >
                  12m
                </button>
              </div>
              <div className={styles.controlsRight}>
                <div className={styles.legend} aria-hidden="true">
                  <span className={styles.legendItem}><span className={styles.legendSwatchPrimary} /> Earnings</span>
                </div>
              </div>
            </div>
            <div className={styles.chartSurface}>
              {loading ? (
                <div className={styles.fullWidth}>
                  <Skeleton height={220} width={'100%'} radius={12} />
                </div>
              ) : (
                <svg className={styles.svgRoot} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Earnings line chart">
                  {/* axes */}
                  <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--color-border)" strokeWidth={1} />
                  <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="var(--color-border)" strokeWidth={1} />
                  {/* y-axis labels (0, mid, max) */}
                  {([0, 0.5, 1] as const).map((t, idx) => {
                    const yVal = yMin + (yMax - yMin) * t;
                    const y = yScale(yVal);
                    return (
                      <g key={idx}>
                        <text x={8} y={y} className={styles.axisLabel}>{t === 1 ? formatCurrency(yMax) : t === 0.5 ? formatCurrency(Math.round((yMax - yMin) / 2)) : formatCurrency(0)}</text>
                        <line x1={padding} x2={width - padding} y1={y} y2={y} stroke="var(--color-border)" strokeDasharray="2,4" />
                      </g>
                    );
                  })}
                  {/* area + line */}
                  <path d={areaD} className={styles.areaFill} />
                  <path d={lineD} className={styles.linePath} />
                  {/* dots */}
                  {series.map((d, i) => (
                    <circle key={i} cx={xScale(d.x)} cy={yScale(d.y)} r={3} fill="var(--color-primary)" />
                  ))}
                </svg>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
