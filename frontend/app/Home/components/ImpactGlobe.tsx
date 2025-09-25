// @AI-HINT: This component renders the interactive 3D globe for the GlobalImpact section.

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from 'next-themes';
import Globe, { GlobeMethods } from 'react-globe.gl';
import * as THREE from 'three';
import { cn } from '@/lib/utils';

import commonStyles from './ImpactGlobe.common.module.css';
import lightStyles from './ImpactGlobe.light.module.css';
import darkStyles from './ImpactGlobe.dark.module.css';

// --- Data Definitions ---
const arcsData = [
  { startLat: 30.3753, startLng: 69.3451, endLat: 34.0522, endLng: -118.2437, color: 'usa' }, // Pakistan to USA
  { startLat: 30.3753, startLng: 69.3451, endLat: 51.5074, endLng: -0.1278, color: 'uk' },    // Pakistan to UK
  { startLat: 30.3753, startLng: 69.3451, endLat: -33.8688, endLng: 151.2093, color: 'aus' }, // Pakistan to Australia
  { startLat: 30.3753, startLng: 69.3451, endLat: 52.5200, endLng: 13.4050, color: 'eur' },  // Pakistan to Germany (EU)
  { startLat: 30.3753, startLng: 69.3451, endLat: 35.6895, endLng: 139.6917, color: 'asia' }, // Pakistan to Japan (Asia)
  { startLat: 30.3753, startLng: 69.3451, endLat: 1.3521, endLng: 103.8198, color: 'asia' },  // Pakistan to Singapore
];

const pointsData = [
  { lat: 30.3753, lng: 69.3451, size: 0.15, color: 'pakistan' }, // Pakistan (larger point)
];

// --- Color Definitions ---
const darkThemeColors = {
  pakistan: '#2ECC71', // Brighter Green
  usa: '#5dade2', // Lighter MegiLance Blue
  uk: '#e74c3c', // Lighter Red
  aus: '#f39c12', // Lighter Orange
  eur: '#AF7AC5', // Lighter Purple
  asia: '#F5D354' // Lighter Yellow
};

const lightThemeColors = {
  pakistan: '#27AE60', // Green
  usa: '#4573df', // MegiLance Blue
  uk: '#e81123', // Red
  aus: '#ff9800', // Orange
  eur: '#9B59B6', // Purple
  asia: '#F2C94C' // Yellow
};

// --- Main Component ---
const ImpactGlobe: React.FC = () => {
  const globeRef = useRef<GlobeMethods | undefined>();
  const { theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const currentThemeColors = theme === 'dark' ? darkThemeColors : lightThemeColors;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getGlobeImageUrl = useCallback(() => {
    if (!isMounted) return '';
    // Use reliable CDN textures from three-globe examples
    return theme === 'dark'
      ? 'https://unpkg.com/three-globe@2.34.7/example/img/earth-dark.jpg'
      : 'https://unpkg.com/three-globe@2.34.7/example/img/earth-blue-marble.jpg';
  }, [isMounted, theme]);

  const getArcColor = useCallback((arc: any) => {
    return currentThemeColors[arc.color as keyof typeof currentThemeColors] || 'rgba(255, 255, 255, 0.5)';
  }, [currentThemeColors]);

  useEffect(() => {
    if (globeRef.current) {
      const globe = globeRef.current;
      globe.pointOfView({ lat: 20, lng: 80, altitude: 2 }, 4000);
      const controls = globe.controls() as any;
      if (controls) {
        controls.enableZoom = false;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.4;
      }
    }
  }, [isMounted]);

  if (!isMounted) {
    return <div className={commonStyles.globePlaceholder} />;
  }

  return (
    <div className={commonStyles.globeContainer}>
      <Globe
        ref={globeRef}
        globeImageUrl={getGlobeImageUrl()}
        bumpImageUrl="https://unpkg.com/three-globe@2.34.7/example/img/earth-topology.png"
        backgroundColor="rgba(0,0,0,0)"
        arcsData={arcsData}
        arcColor={getArcColor}
        arcDashLength={0.4}
        arcDashGap={0.8}
        arcDashAnimateTime={2000}
        arcStroke={0.2}
        pointsData={pointsData}
        pointColor={d => currentThemeColors[(d as any).color as keyof typeof currentThemeColors]}
        pointAltitude={0}
        pointRadius={d => (d as any).size}
        width={600}
        height={600}
      />
    </div>
  );
};

export default ImpactGlobe;