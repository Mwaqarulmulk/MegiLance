'use client';

import { useEffect, useRef, useState, useCallback, ComponentType } from 'react';
import commonStyles from './Whiteboard.common.module.css';
import lightStyles from './Whiteboard.light.module.css';
import darkStyles from './Whiteboard.dark.module.css';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import { useWebSocket } from '@/hooks/useWebSocket';

// Type for the CanvasDraw component instance
interface CanvasDrawInstance {
  clear: () => void;
  undo: () => void;
  getSaveData: () => string;
  loadSaveData: (data: string) => void;
}

// Props type for the CanvasDraw component
interface CanvasDrawProps {
  brushColor?: string;
  canvasWidth?: string | number;
  canvasHeight?: number;
  hideGrid?: boolean;
  hideInterface?: boolean;
  onChange?: (canvas: CanvasDrawInstance) => void;
  lazyRadius?: number;
  brushRadius?: number;
  catenaryColor?: string;
  gridColor?: string;
  backgroundColor?: string;
  disabled?: boolean;
  imgSrc?: string;
  saveData?: string;
  immediateLoading?: boolean;
  gridSizeX?: number;
  gridSizeY?: number;
  gridLineWidth?: number;
  enablePanAndZoom?: boolean;
  clampLinesToDocument?: boolean;
}

// Dynamic import with proper typing
const CanvasDraw = dynamic(
  () => import('react-canvas-draw').then((mod) => mod.default as ComponentType<CanvasDrawProps>),
  { ssr: false }
) as ComponentType<CanvasDrawProps>;

interface WhiteboardProps {
  contractId: string;
}

export default function Whiteboard({ contractId }: WhiteboardProps) {
  const { resolvedTheme } = useTheme();
  const { connected, on, off, send } = useWebSocket();
  const canvasInstanceRef = useRef<CanvasDrawInstance | null>(null);
  const [mounted, setMounted] = useState(false);

  const lastSentData = useRef<string>('');
  const isDrawingFromSocket = useRef<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Join/leave collab room
  useEffect(() => {
    if (connected && contractId) {
      send('join_chat', { chat_id: contractId });
    }
    return () => {
      if (connected && contractId) {
        send('leave_chat', { chat_id: contractId });
      }
    };
  }, [connected, contractId, send]);

  // Listen for remote drawings
  useEffect(() => {
    if (!connected) return;

    const handleRemoteDraw = (data: any) => {
      if (data && data.drawing && data.drawing !== lastSentData.current) {
        lastSentData.current = data.drawing;
        isDrawingFromSocket.current = true;
        canvasInstanceRef.current?.loadSaveData(data.drawing);
        setTimeout(() => {
          isDrawingFromSocket.current = false;
        }, 100);
      }
    };

    on('draw_updated', handleRemoteDraw);
    return () => {
      off('draw_updated', handleRemoteDraw);
    };
  }, [connected, on, off]);

  // Local changes periodic broadcast
  useEffect(() => {
    if (!connected) return;

    const interval = setInterval(() => {
      if (isDrawingFromSocket.current || !canvasInstanceRef.current) return;
      const data = canvasInstanceRef.current.getSaveData();
      // Ensure we don't send empty drawing string as initial duplicate
      if (data && data !== lastSentData.current && data !== '{"lines":[],"width":"100%","height":400}') {
        lastSentData.current = data;
        send('draw_change', { contract_id: contractId, drawing: data });
      }
    }, 300);

    return () => clearInterval(interval);
  }, [connected, contractId, send]);

  const handleClear = useCallback(() => {
    canvasInstanceRef.current?.clear();
    if (connected) {
      const data = '{"lines":[],"width":"100%","height":400}';
      lastSentData.current = data;
      send('draw_change', { contract_id: contractId, drawing: data });
    }
  }, [connected, contractId, send]);

  const handleUndo = useCallback(() => {
    canvasInstanceRef.current?.undo();
    // Trigger update immediately
    setTimeout(() => {
      if (connected && canvasInstanceRef.current) {
        const data = canvasInstanceRef.current.getSaveData();
        lastSentData.current = data;
        send('draw_change', { contract_id: contractId, drawing: data });
      }
    }, 50);
  }, [connected, contractId, send]);

  // Capture canvas instance via onChange
  const handleCanvasChange = useCallback((canvas: CanvasDrawInstance) => {
    canvasInstanceRef.current = canvas;
  }, []);

  if (!mounted || !resolvedTheme) return null;

  const themeStyles = resolvedTheme === 'light' ? lightStyles : darkStyles;

  return (
    <div className={cn(commonStyles.container, themeStyles.container)}>
      <div className={commonStyles.header}>
        <h3>Interactive Whiteboard</h3>
        <div className={commonStyles.actions}>
          <button type="button" onClick={handleClear} className={themeStyles.button}>Clear</button>
          <button type="button" onClick={handleUndo} className={themeStyles.button}>Undo</button>
          <span className={cn(themeStyles.badge, connected ? themeStyles.connected : '')} style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', background: 'rgba(0,0,0,0.1)' }}>
            {connected ? 'Syncing' : 'Offline'}
          </span>
        </div>
      </div>
      <div className={commonStyles.canvasWrapper}>
        <CanvasDraw
          onChange={handleCanvasChange}
          brushColor={resolvedTheme === 'dark' ? '#fff' : '#000'}
          canvasWidth="100%"
          canvasHeight={400}
          hideGrid={false}
          hideInterface={true}
        />
      </div>
    </div>
  );
}
