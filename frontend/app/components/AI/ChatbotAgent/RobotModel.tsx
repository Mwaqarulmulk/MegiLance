'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import { MessageCircle } from 'lucide-react';

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
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} style={{ width: size, height: size, pointerEvents: 'none' }}>
        <ambientLight intensity={resolvedTheme === 'dark' ? 0.5 : 1} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Environment preset="city" />
        <React.Suspense fallback={null}>
          <InnerRobot />
        </React.Suspense>
      </Canvas>
    </div>
  );
}
