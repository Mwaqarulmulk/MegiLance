'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Maximize2 } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import commonStyles from './FloatingRobotWidget.common.module.css';

// 3D Robot Model Component
function RobotModel({ isHovered }: { isHovered: boolean }) {
  const group = useRef<any>(null);
  const { scene } = useGLTF('/3d/robot/scene.gltf');
  
  useFrame((state) => {
    if (group.current) {
      // Gentle floating animation
      group.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
      
      // Rotate slowly or look at mouse
      if (isHovered) {
        group.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.2;
      } else {
        group.current.rotation.y = state.clock.elapsedTime * 0.5;
      }
    }
  });

  return (
    <group ref={group} dispose={null}>
      <primitive object={scene} scale={1.5} position={[0, -1, 0]} />
    </group>
  );
}

export default function FloatingRobotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [greeting, setGreeting] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    // Determine greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning! Need help?');
    else if (hour < 18) setGreeting('Good afternoon! How can I assist?');
    else setGreeting('Good evening! What can I do for you?');
  }, []);

  const openFullChat = () => {
    setIsOpen(false);
    router.push('/ai/chatbot');
  };

  if (pathname === '/ai/chatbot' || pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <div className={commonStyles.widgetContainer}>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={commonStyles.widgetPopup}
          >
            <div className={commonStyles.widgetHeader}>
              <div className={commonStyles.headerTitle}>
                <span className={commonStyles.statusDot}></span>
                MegiBot AI
              </div>
              <div className={commonStyles.headerActions}>
                <button onClick={openFullChat} className={commonStyles.iconBtn} title="Open full chat">
                  <Maximize2 size={16} />
                </button>
                <button onClick={() => setIsOpen(false)} className={commonStyles.iconBtn} title="Close">
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className={commonStyles.widgetBody}>
              <div className={commonStyles.messageBot}>
                <div className={commonStyles.messageBubbleBot}>
                  {greeting} I am MegiBot, your personal AI assistant. 
                  Click the maximize button above to start a conversation!
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        className={cn(commonStyles.buttonWrapper, isOpen && commonStyles.buttonWrapperActive)}
      >
        {/* Render 3D Robot if WebGL is supported, otherwise fallback */}
        <div 
          className={commonStyles.canvasContainer}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => setIsOpen(!isOpen)}
        >
          <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
            <ambientLight intensity={0.8} />
            <pointLight position={[10, 10, 10]} intensity={1.5} />
            <Environment preset="city" />
            <React.Suspense fallback={null}>
              <RobotModel isHovered={isHovered} />
            </React.Suspense>
            <OrbitControls enableZoom={false} enablePan={false} />
          </Canvas>
          
          <AnimatePresence>
            {isHovered && !isOpen && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={commonStyles.tooltipMsg}
              >
                Hi there! 👋
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
