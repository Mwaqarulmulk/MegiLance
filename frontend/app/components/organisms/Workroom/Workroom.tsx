import { useState, useEffect } from 'react';
import commonStyles from './Workroom.common.module.css';
import lightStyles from './Workroom.light.module.css';
import darkStyles from './Workroom.dark.module.css';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import LiveEditor from './LiveEditor';
import Whiteboard from './Whiteboard';
import VideoChat from './VideoChat';
import { Code, PenTool, Video as VideoIcon, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Loading from '@/app/components/atoms/Loading/Loading';

interface WorkroomProps {
  contractId: string;
}

export default function Workroom({ contractId }: WorkroomProps) {
  const { resolvedTheme, theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'editor' | 'whiteboard'>('editor');
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardUrl, setDashboardUrl] = useState('/dashboard');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const area = localStorage.getItem('portal_area') || localStorage.getItem('ml_user_role');
      if (area) {
        setDashboardUrl(area.includes('client') ? '/client/dashboard' : '/freelancer/dashboard');
      }
    }
  }, []);

  // Wait for theme to resolve
  useEffect(() => {
    if (theme) {
      // Small delay to ensure theme is fully resolved
      const timer = setTimeout(() => setIsLoading(false), 100);
      return () => clearTimeout(timer);
    }
  }, [theme]);

  // Defensive: ensure contractId is valid
  const safeContractId = contractId?.toString() || '';
  const displayId = safeContractId.length >= 8 ? safeContractId.substring(0, 8) : safeContractId;

  if (isLoading || !resolvedTheme) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading text="Loading collaboration room..." />
      </div>
    );
  }

  const themeStyles = resolvedTheme === 'light' ? lightStyles : darkStyles;

  return (
    <div className={cn(commonStyles.container, themeStyles.container)}>
      <div className={commonStyles.header}>
        <div className={commonStyles.headerLeft}>
          <Link href={dashboardUrl} className={themeStyles.backButton}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <h2>Live Collaboration Room</h2>
          <span className={themeStyles.contractBadge}>Contract #{displayId}</span>
        </div>
      </div>

      <div className={commonStyles.content}>
        <div className={commonStyles.mainArea}>
          <div className={themeStyles.tabs}>
            <button 
              className={cn(commonStyles.tabBtn, themeStyles.tabBtn, activeTab === 'editor' && themeStyles.activeTab)}
              onClick={() => setActiveTab('editor')}
            >
              <Code size={16} /> Code Editor
            </button>
            <button 
              className={cn(commonStyles.tabBtn, themeStyles.tabBtn, activeTab === 'whiteboard' && themeStyles.activeTab)}
              onClick={() => setActiveTab('whiteboard')}
            >
              <PenTool size={16} /> Whiteboard
            </button>
          </div>
          
          <div className={commonStyles.tabContent}>
            {activeTab === 'editor' ? (
              <LiveEditor contractId={contractId} />
            ) : (
              <Whiteboard contractId={contractId} />
            )}
          </div>
        </div>

        <div className={commonStyles.sidebar}>
          <div className={commonStyles.sidebarSection}>
            <h3 className={commonStyles.sectionTitle}><VideoIcon size={16} /> Active Call</h3>
            <VideoChat contractId={contractId} />
          </div>
          
          <div className={commonStyles.sidebarSection}>
            <h3 className={commonStyles.sectionTitle}>Participants (2)</h3>
            <ul className={themeStyles.participantList}>
              <li>
                <div className={commonStyles.avatarSm}>Y</div>
                <span>You</span>
              </li>
              <li>
                <div className={commonStyles.avatarSm}>C</div>
                <span>Client</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
