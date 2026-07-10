'use client';

import { useEffect, useRef } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useToaster } from '@/app/components/molecules/Toast/ToasterProvider';

const PLAY_CHIME_LS_KEY = 'megilance_notification_sound';

export default function GlobalNotificationListener() {
  const { connected, on, off } = useWebSocket();
  const { notify } = useToaster();
  const audioContextRef = useRef<AudioContext | null>(null);

  const playChime = () => {
    // Check local storage setting (default is enabled if not set)
    const soundSetting = localStorage.getItem(PLAY_CHIME_LS_KEY);
    if (soundSetting === 'false') return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const gainNode = ctx.createGain();
      gainNode.connect(ctx.destination);

      // Play C5 and E5 to make a beautiful premium notification chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();

      osc1.connect(gainNode);
      osc2.connect(gainNode);

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.15); // G5

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(329.63, now); // E4
      osc2.frequency.exponentialRampToValueAtTime(659.25, now + 0.2); // E5

      gainNode.gain.setValueAtTime(0.0, now);
      gainNode.gain.linearRampToValueAtTime(0.12, now + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc1.start(now);
      osc2.start(now + 0.05);
      osc1.stop(now + 0.7);
      osc2.stop(now + 0.7);
    } catch (err) {
      console.warn('[GlobalNotificationListener] Play chime failed:', err);
    }
  };

  useEffect(() => {
    if (!connected) return;

    const handleNewNotification = (data: any) => {
      // Map event priority to toast variants
      let variant: 'info' | 'success' | 'danger' | 'warning' = 'info';
      if (data.priority === 'high' || data.priority === 'urgent') {
        variant = 'warning';
      } else if (data.type?.includes('payment') || data.type?.includes('escrow')) {
        variant = 'success';
      }

      // Enqueue the notification toast
      notify({
        title: data.title || 'New Notification',
        description: data.content || data.body || data.message || '',
        variant,
        duration: 5000,
      });

      // Play the ambient synthetic sound chime
      playChime();
    };

    on('notification', handleNewNotification);
    return () => {
      off('notification', handleNewNotification);
    };
  }, [connected, on, off, notify]);

  return null;
}
