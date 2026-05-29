// @AI-HINT: Embedded WebRTC Video/Audio component for real-time client-freelancer sessions
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import commonStyles from './VideoCall.common.module.css';
import lightStyles from './VideoCall.light.module.css';
import darkStyles from './VideoCall.dark.module.css';
import { Mic, MicOff, Video, VideoOff, PhoneMissed, MonitorUp, Settings, Loader2 } from 'lucide-react';
import Button from '@/app/components/atoms/Button/Button';

interface VideoCallProps {
  roomId: string;
  userName: string;
  onLeave?: () => void;
}

export default function VideoCall({ roomId, userName, onLeave }: VideoCallProps) {
  const { resolvedTheme } = useTheme();
  const themeStyles = resolvedTheme === 'light' ? lightStyles : darkStyles;
  
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setIsConnecting(true);
    setIsConnected(false);

    // In production, this would call navigator.mediaDevices.getUserMedia
    // and initialize WebRTC peer connection. For now, show connecting state.
    const timer = setTimeout(() => {
      setIsConnecting(false);
    }, 3000);

    return () => {
      clearTimeout(timer);
      setIsConnected(false);
      setIsConnecting(false);
    };
  }, [roomId]);

  const handleConnect = () => {
    setIsConnecting(true);
    // In production, initiate WebRTC connection here
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
    }, 2000);
  };

  return (
    <div className={cn(commonStyles.videoContainer, themeStyles.videoContainer)}>
      {(isConnecting || !isConnected) && (
        <div className={commonStyles.overlay}>
          {isConnecting ? (
            <>
              <Loader2 size={48} className={commonStyles.loadingSpinner} />
              <h2>Connecting to room...</h2>
              <p>Room: {roomId}</p>
            </>
          ) : (
            <>
              <h2>Not Connected</h2>
              <p>Click below to join the call.</p>
              <Button variant="primary" size="md" onClick={handleConnect} className={commonStyles.connectBtn}>
                Join Call
              </Button>
            </>
          )}
        </div>
      )}

      <div className={commonStyles.videoGrid}>
        {/* Remote Video */}
        <div className={commonStyles.remoteVideoWrapper}>
          <div className={cn(commonStyles.placeholder, themeStyles.placeholder)}>
            <span className={commonStyles.avatarText}>Client Name</span>
          </div>
          <video 
            ref={remoteVideoRef} 
            className={commonStyles.remoteVideo} 
            autoPlay 
            playsInline 
            muted 
          />
          <div className={commonStyles.nameTag}>Client Name</div>
        </div>

        {/* Local Video */}
        <div className={commonStyles.localVideoWrapper}>
          <div className={cn(commonStyles.placeholderLocal, themeStyles.placeholderLocal)}>
            <span className={commonStyles.avatarText}>{userName.charAt(0)}</span>
          </div>
          <video 
            ref={localVideoRef} 
            className={commonStyles.localVideo} 
            autoPlay 
            playsInline 
            muted={isAudioMuted} 
          />
          <div className={commonStyles.nameTag}>You ({userName})</div>
        </div>
      </div>

      <div className={cn(commonStyles.controls, themeStyles.controls)}>
        <Button 
          variant={isAudioMuted ? "danger" : "secondary"} 
          size="icon" 
          onClick={() => setIsAudioMuted(!isAudioMuted)}
          className={commonStyles.controlBtn}
          disabled={!isConnected}
        >
          {isAudioMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </Button>

        <Button 
          variant={isVideoMuted ? "danger" : "secondary"} 
          size="icon" 
          onClick={() => setIsVideoMuted(!isVideoMuted)}
          className={commonStyles.controlBtn}
          disabled={!isConnected}
        >
          {isVideoMuted ? <VideoOff size={20} /> : <Video size={20} />}
        </Button>

        <Button 
          variant={isScreenSharing ? "primary" : "secondary"} 
          size="icon" 
          onClick={() => setIsScreenSharing(!isScreenSharing)}
          className={commonStyles.controlBtn}
          disabled={!isConnected}
        >
          <MonitorUp size={20} />
        </Button>

        <Button 
          variant="secondary" 
          size="icon" 
          className={commonStyles.controlBtn}
          disabled={!isConnected}
        >
          <Settings size={20} />
        </Button>

        <Button 
          variant="danger" 
          size="md" 
          onClick={() => {
            setIsConnected(false);
            setIsConnecting(false);
            if (onLeave) onLeave();
          }}
          className={commonStyles.leaveBtn}
        >
          <PhoneMissed size={20} className={commonStyles.btnIcon} /> Leave
        </Button>
      </div>
      
      {!isConnected && !isConnecting && (
         <div className={commonStyles.overlay}>
           <h2>Disconnected</h2>
           <p>You have left the call.</p>
         </div>
      )}
    </div>
  );
}
