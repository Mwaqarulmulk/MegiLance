'use client';

import React, { useRef, useState, useEffect, Component } from 'react';
import { useTheme } from 'next-themes';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { MessageCircle } from 'lucide-react';

class ThreeErrorBoundary extends Component<{ children: React.ReactNode; fallback: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

interface RobotModelProps {
  size?: number;
}

function InnerRobot() {
  const group = useRef<any>(null);
  const { scene } = useGLTF('/3d/robot/scene.gltf');
  
  useFrame((state) => {
    if (group.current) {
      group.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
      group.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <group ref={group} dispose={null}>
      <primitive object={scene} scale={1.8} position={[0, -0.7, 0]} />
    </group>
  );
}

export default function RobotModel({ size = 100 }: RobotModelProps) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ width: size, height: size }} className="animate-pulse bg-primary/20 rounded-full" />;
  }

  return (
    <div style={{ 
      width: size, 
      height: size, 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      filter: resolvedTheme === 'dark' ? 'drop-shadow(0 0 5px rgba(69,115,223,0.5))' : 'drop-shadow(0 0 3px rgba(69,115,223,0.3))',
      borderRadius: '50%',
      pointerEvents: 'none'
    }}>
      <ThreeErrorBoundary fallback={<MessageCircle size={size * 0.5} style={{ opacity: 0.6 }} />}>
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }} style={{ width: size, height: size, pointerEvents: 'none' }}>
          <ambientLight intensity={resolvedTheme === 'dark' ? 0.5 : 1} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -5]} intensity={0.3} />
          <React.Suspense fallback={null}>
            <InnerRobot />
          </React.Suspense>
        </Canvas>
      </ThreeErrorBoundary>
    </div>
  );
}
