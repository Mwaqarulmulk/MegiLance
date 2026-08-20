// @AI-HINT: Enhanced AI Chatbot V2 with real-time status, tool-calling client assistant integration, rich card rendering, and modern UI
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api/core';
import { clientAssistantApi } from '@/lib/api/ai';
import AIStatusIndicator from '@/app/components/AI/AIStatusIndicator/AIStatusIndicator';
import { PageTransition } from '@/app/components/Animations/PageTransition';
import Image from 'next/image';
import { ScrollReveal } from '@/app/components/Animations/ScrollReveal';
import { AuroraBackground, BorderBeam } from '@/app/components/AI/kit';
import {
  Send,
  Trash2,
  MoreVertical,
  Bot,
  User,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Zap,
  MessageSquare,
  Info,
  Mic,
  Volume2,
  Sparkles,
  Star,
  DollarSign,
  CheckCircle2,
  UserPlus,
  ExternalLink,
  Briefcase,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

import commonStyles from './ChatbotEnhanced.common.module.css';
import lightStyles from './ChatbotEnhanced.light.module.css';
import darkStyles from './ChatbotEnhanced.dark.module.css';

// ============================================================================
// Types
// ============================================================================

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  query: string;
}

interface AgentToolResult {
  tool_name: string;
  display_type: string;
  data: Record<string, any>;
}

interface AgentActionButton {
  label: string;
  href: string;
  variant?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sentiment?: 'positive' | 'neutral' | 'negative';
  suggestions?: string[];
  action_buttons?: AgentActionButton[];
  tool_results?: AgentToolResult[];
  isError?: boolean;
}

interface AIConnectionStatus {
  isOnline: boolean;
  isConnecting: boolean;
  lastPing: Date | null;
  latency: number | null;
  mode: 'online' | 'offline' | 'degraded';
  backendAvailable: boolean;
  aiServiceAvailable: boolean;
  error: string | null;
}

// ============================================================================
// Constants
// ============================================================================

const QUICK_ACTIONS: QuickAction[] = [
  { icon: <User size={14} />, label: 'Find React & Python Devs', query: 'I need a React and Python full-stack developer with $4000 budget' },
  { icon: <DollarSign size={14} />, label: 'Estimate Project Cost', query: 'Estimate cost for building an e-commerce mobile app' },
  { icon: <TrendingUp size={14} />, label: 'Check Market Rates', query: 'What are the market rates for UI/UX designers?' },
  { icon: <Briefcase size={14} />, label: 'Post a Project', query: 'Help me write and post a project for web development' },
];

// Offline fallback generator
function generateOfflineResponse(message: string): {
  content: string;
  suggestions?: string[];
  action_buttons?: AgentActionButton[];
  tool_results?: AgentToolResult[];
} {
  const msg = message.toLowerCase();

  if (/react|python|developer|freelancer|talent|hire|find/.test(msg)) {
    return {
      content: `Here are matching top-rated freelancers currently available on MegiLance:`,
      suggestions: ['Estimate project cost', 'Post a project', 'View market rates'],
      action_buttons: [
        { label: 'Browse All Talent', href: '/client/search', variant: 'primary' },
        { label: 'Post a Project', href: '/client/projects/create', variant: 'secondary' },
      ],
      tool_results: [
        {
          tool_name: 'search_freelancers',
          display_type: 'freelancer_cards',
          data: {
            freelancers: [
              {
                id: '1',
                full_name: 'Alex Rivera',
                title: 'Senior Full-Stack Engineer',
                hourly_rate: 65,
                rating: 4.9,
                skills: 'React, Node.js, Python, TypeScript',
              },
              {
                id: '2',
                full_name: 'Sarah Chen',
                title: 'AI & Full-Stack Specialist',
                hourly_rate: 75,
                rating: 5.0,
                skills: 'React, FastAPI, Python, PostgreSQL',
              },
            ],
          },
        },
      ],
    };
  }

  if (/cost|budget|estimate|price/.test(msg)) {
    return {
      content: `Based on current market benchmarks across verified projects:`,
      suggestions: ['Find matching freelancers', 'Post this project', 'Check hourly rates'],
      action_buttons: [
        { label: 'Post a Project', href: '/client/projects/create', variant: 'primary' },
      ],
      tool_results: [
        {
          tool_name: 'estimate_project_cost',
          display_type: 'cost_estimate',
          data: {
            total_min: 2000,
            total_max: 5500,
            estimated_timeline: '3–6 weeks',
          },
        },
      ],
    };
  }

  return {
    content: `Hello! 👋 I'm **Megi**, your AI hiring and marketplace copilot on MegiLance.\n\nI can help you **find top-rated talent**, estimate project pricing, plan scope milestones, and manage escrow contracts securely.\n\nHow can I help you today?`,
    suggestions: [
      'Find React and Python developers',
      'Estimate project cost for mobile app',
      'What are market rates for designers?',
      'How does milestone escrow work?',
    ],
    action_buttons: [
      { label: 'Browse Talent', href: '/client/search', variant: 'primary' },
      { label: 'Post a Project', href: '/client/projects/create', variant: 'secondary' },
    ],
  };
}

// ============================================================================
// Tool Result Renderers
// ============================================================================

function FreelancerCardsView({
  data,
  onNavigate,
}: {
  data: Record<string, any>;
  onNavigate: (href: string) => void;
}) {
  const list = (data.freelancers || []) as any[];
  if (!list.length) return <div className="text-xs opacity-70 p-2">No matching freelancers found yet.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
      {list.map((f, i) => {
        const name = f.full_name || f.name || 'Freelancer';
        const initials =
          name
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'FL';
        const ratingNum = f.rating != null ? Number(f.rating) : 5.0;
        const matchText = f.match_score
          ? `${f.match_score}% Match`
          : ratingNum >= 4.8
          ? 'Top Match'
          : `${Math.round(ratingNum * 19 + 5)}% Match`;
        const skillsList = Array.isArray(f.skills)
          ? f.skills
          : typeof f.skills === 'string'
          ? f.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
          : [];
        const freelancerId = f.id ?? f.user_id;

        return (
          <div
            key={i}
            style={{
              border: '1px solid rgba(127,127,127,0.22)',
              background: 'rgba(127,127,127,0.06)',
              borderRadius: 14,
              padding: '0.85rem 0.95rem',
              fontSize: '0.82rem',
              lineHeight: 1.45,
            }}
          >
            {/* Top: Avatar, Name, Title, Match Badge */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                {f.avatar_url ? (
                  <img
                    src={f.avatar_url}
                    alt={name}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      flexShrink: 0,
                      border: '2px solid rgba(99,102,241,0.3)',
                    }}
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {initials}
                  </div>
                )}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                    <CheckCircle2 size={13} style={{ color: '#3b82f6', flexShrink: 0 }} />
                  </div>
                  <div
                    style={{
                      opacity: 0.75,
                      fontSize: '0.78rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {f.title || 'Verified Specialist'}
                  </div>
                </div>
              </div>

              {/* Match Score Badge */}
              <span
                style={{
                  background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.12))',
                  color: '#10b981',
                  border: '1px solid rgba(16,185,129,0.3)',
                  borderRadius: 20,
                  padding: '2px 8px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                <Sparkles size={11} /> {matchText}
              </span>
            </div>

            {/* Stats Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 8,
                padding: '4px 0',
                borderTop: '1px solid rgba(127,127,127,0.12)',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700, fontSize: '0.84rem' }}>
                <DollarSign size={13} style={{ color: '#10b981' }} />
                <span>{f.hourly_rate ? `$${f.hourly_rate}/hr` : 'Market rate'}</span>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600, fontSize: '0.82rem' }}>
                <Star size={13} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                <span>{ratingNum.toFixed(1)} ★</span>
              </span>
            </div>

            {/* Skills */}
            {skillsList.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                {skillsList.slice(0, 3).map((sk: string, idx: number) => (
                  <span
                    key={idx}
                    style={{
                      background: 'rgba(99,102,241,0.1)',
                      color: 'inherit',
                      border: '1px solid rgba(99,102,241,0.22)',
                      borderRadius: 6,
                      padding: '2px 6px',
                      fontSize: '0.7rem',
                      fontWeight: 500,
                    }}
                  >
                    {sk}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button
                style={{
                  border: 'none',
                  borderRadius: 8,
                  padding: '0.45rem 0.65rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff',
                  flex: 1,
                }}
                onClick={() =>
                  onNavigate(
                    freelancerId ? `/client/projects/create?invite=${freelancerId}` : '/client/projects/create'
                  )
                }
              >
                <UserPlus size={13} /> Invite to Job
              </button>
              <button
                style={{
                  border: '1px solid rgba(127,127,127,0.35)',
                  borderRadius: 8,
                  padding: '0.45rem 0.65rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  background: 'transparent',
                  color: 'inherit',
                  flex: 1,
                }}
                onClick={() => onNavigate(freelancerId ? `/freelancer/${freelancerId}` : '/client/search')}
              >
                <ExternalLink size={13} /> View Profile
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CostEstimateView({ data }: { data: Record<string, any> }) {
  return (
    <div
      style={{
        border: '1px solid rgba(127,127,127,0.22)',
        background: 'rgba(127,127,127,0.06)',
        borderRadius: 12,
        padding: '0.75rem 0.85rem',
        marginTop: 8,
        fontSize: '0.82rem',
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
        <DollarSign size={14} style={{ color: '#10b981' }} /> Cost & Budget Estimate
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
        <span style={{ opacity: 0.7 }}>Estimated Range:</span>
        <span style={{ fontWeight: 700 }}>${data.total_min ?? '—'} – ${data.total_max ?? '—'}</span>
      </div>
      {data.estimated_timeline && (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
          <span style={{ opacity: 0.7 }}>Timeline:</span>
          <span>{data.estimated_timeline}</span>
        </div>
      )}
    </div>
  );
}

function MarketRatesView({ data }: { data: Record<string, any> }) {
  const rates = (data.rates || []) as any[];
  return (
    <div
      style={{
        border: '1px solid rgba(127,127,127,0.22)',
        background: 'rgba(127,127,127,0.06)',
        borderRadius: 12,
        padding: '0.75rem 0.85rem',
        marginTop: 8,
        fontSize: '0.82rem',
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
        <TrendingUp size={14} style={{ color: '#6366f1' }} /> Market Rates ({data.period || 'hourly'})
      </div>
      {rates.map((r, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
          <span style={{ opacity: 0.7 }}>{r.role}</span>
          <span>${r.min}–${r.max}/hr (avg ${r.avg})</span>
        </div>
      ))}
    </div>
  );
}

function ConfirmCardView({
  result,
  onConfirmed,
}: {
  result: AgentToolResult;
  onConfirmed: (msg: string, url?: string) => void;
}) {
  const data = result.data || {};
  const draft = (data.draft || {}) as Record<string, any>;
  const endpoint = data.confirm_endpoint as string;
  const [state, setState] = useState<'idle' | 'working' | 'done' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState('');

  const isProject = result.display_type === 'confirm_post_project';
  const isProposal = result.display_type === 'confirm_submit_proposal';
  const title = isProject ? 'Confirm project posting' : isProposal ? 'Confirm proposal' : 'Confirm profile update';

  const rows: { label: string; value: string }[] = (() => {
    if (result.display_type === 'confirm_update_profile' && Array.isArray(data.fields)) {
      return (data.fields as any[]).map((f) => ({ label: f.label, value: String(f.value) }));
    }
    if (isProposal) {
      return [
        { label: 'Project', value: String(draft.project_title ?? draft.project_id ?? '') },
        { label: 'Bid', value: draft.bid_amount ? `$${draft.bid_amount}` : '—' },
        ...(draft.availability ? [{ label: 'Start', value: String(draft.availability) }] : []),
      ];
    }
    return [
      { label: 'Title', value: String(draft.title ?? '') },
      { label: 'Category', value: String(draft.category ?? '') },
      {
        label: 'Budget',
        value:
          draft.budget_min || draft.budget_max
            ? `$${draft.budget_min ?? '?'}–$${draft.budget_max ?? '?'}`
            : draft.budget
            ? `$${draft.budget}`
            : '—',
      },
      ...(draft.skills ? [{ label: 'Skills', value: String(draft.skills) }] : []),
      ...(draft.timeline ? [{ label: 'Timeline', value: String(draft.timeline) }] : []),
    ];
  })();

  const handleConfirm = async () => {
    setState('working');
    setErrMsg('');
    try {
      const res = await apiFetch<any>(endpoint || '/ai/client-assistant/actions/post-project', {
        method: 'POST',
        body: JSON.stringify(draft),
      });
      setState('done');
      onConfirmed(res.message || 'Action completed successfully!', res.url);
    } catch (err: any) {
      setState('error');
      setErrMsg(err?.message || 'Action failed. Please review the details.');
    }
  };

  return (
    <div
      style={{
        border: '1px solid rgba(99,102,241,0.3)',
        background: 'rgba(99,102,241,0.06)',
        borderRadius: 12,
        padding: '0.85rem',
        marginTop: 8,
        fontSize: '0.82rem',
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
        <CheckCircle2 size={14} style={{ color: '#6366f1' }} /> {title}
      </div>
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
          <span style={{ opacity: 0.7 }}>{r.label}:</span>
          <span style={{ fontWeight: 600, textAlign: 'right' }}>{r.value}</span>
        </div>
      ))}
      {state === 'error' && <div style={{ color: '#ef4444', marginTop: 6 }}>{errMsg}</div>}
      {state === 'done' ? (
        <div style={{ color: '#10b981', marginTop: 8, fontWeight: 600 }}>✓ Confirmed & Applied</div>
      ) : (
        <div style={{ marginTop: 10 }}>
          <button
            style={{
              border: 'none',
              borderRadius: 8,
              padding: '0.45rem 0.85rem',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff',
            }}
            onClick={handleConfirm}
            disabled={state === 'working'}
          >
            {state === 'working' ? 'Confirming…' : 'Confirm & Post'}
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

const ChatbotEnhanced: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showActions, setShowActions] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognitionAvailable, setRecognitionAvailable] = useState(false);
  const recognitionRef = useRef<any>(null);

  const [status, setStatus] = useState<AIConnectionStatus>({
    isOnline: true,
    isConnecting: false,
    lastPing: new Date(),
    latency: 24,
    mode: 'online',
    backendAvailable: true,
    aiServiceAvailable: true,
    error: null,
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const themeStyles = mounted && resolvedTheme === 'light' ? lightStyles : darkStyles;

  // Sound effects utility
  const playSound = (type: 'send' | 'receive') => {
    try {
      const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      if (type === 'send') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
      }
    } catch {
      // Audio autoplay restrictions
    }
  };

  // Initialize and load welcome message
  useEffect(() => {
    setMounted(true);
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (SpeechRecognition) setRecognitionAvailable(true);

    const initWelcome = async () => {
      if (isAuthenticated) {
        try {
          const welcome = await clientAssistantApi.getWelcomeMessage();
          setMessages([
            {
              id: `welcome-${Date.now()}`,
              role: 'assistant',
              content: welcome.message || "Hello! 👋 I'm **Megi**, your AI hiring assistant. How can I help you today?",
              timestamp: new Date(),
              sentiment: 'positive',
              suggestions: welcome.suggestions,
              action_buttons: welcome.action_buttons,
            },
          ]);
          return;
        } catch {
          // Fall through to default
        }
      }

      const defaultOffline = generateOfflineResponse('');
      setMessages([
        {
          id: `welcome-${Date.now()}`,
          role: 'assistant',
          content: defaultOffline.content,
          timestamp: new Date(),
          sentiment: 'positive',
          suggestions: defaultOffline.suggestions,
          action_buttons: defaultOffline.action_buttons,
        },
      ]);
    };

    initWelcome();
  }, [isAuthenticated]);

  // Focus input on mount
  useEffect(() => {
    if (mounted) {
      inputRef.current?.focus();
    }
  }, [mounted]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Speech output
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    try {
      const clean = text.replace(/[*_#`[\]()]/g, '');
      const utter = new SpeechSynthesisUtterance(clean);
      utter.lang = 'en-US';
      utter.onstart = () => setIsSpeaking(true);
      utter.onend = () => setIsSpeaking(false);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    } catch (e) {
      console.warn('speech error', e);
    }
  };

  // Voice input
  const startRecognition = () => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) return;
    const recog = new SpeechRecognition();
    recog.lang = 'en-US';
    recog.interimResults = false;
    recog.maxAlternatives = 1;
    recog.onresult = (ev: any) => {
      const transcript = ev.results[0][0].transcript;
      sendMessage(transcript);
    };
    recog.onerror = (e: any) => console.warn('recog error', e);
    recog.onend = () => {
      recognitionRef.current = null;
    };
    recognitionRef.current = recog;
    recog.start();
  };

  // Send message handler
  const sendMessage = async (content: string) => {
    if (!content.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    playSound('send');

    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const endpoint = isAuthenticated ? '/ai/client-assistant/chat' : '/ai/client-assistant/guest-chat';
      const res = await apiFetch<any>(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          message: content.trim(),
          conversation_history: history,
          page_context: '/ai/chatbot',
        }),
      });

      playSound('receive');
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: res.reply || res.message || 'I have processed your request.',
        timestamp: new Date(),
        suggestions: res.suggestions,
        action_buttons: res.action_buttons,
        tool_results: res.tool_results,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.warn('AI Assistant error, falling back to offline generator:', err);
      playSound('receive');
      const offline = generateOfflineResponse(content);
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: offline.content,
        timestamp: new Date(),
        suggestions: offline.suggestions,
        action_buttons: offline.action_buttons,
        tool_results: offline.tool_results,
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(input);
  };

  const handleQuickAction = async (query: string) => {
    await sendMessage(query);
  };

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearMessages = () => {
    setMessages([]);
    const defaultOffline = generateOfflineResponse('');
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: defaultOffline.content,
        timestamp: new Date(),
        sentiment: 'positive',
        suggestions: defaultOffline.suggestions,
        action_buttons: defaultOffline.action_buttons,
      },
    ]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <PageTransition>
      <div className={cn(commonStyles.container, themeStyles.container, 'relative overflow-hidden')}>
        <AuroraBackground isDark={resolvedTheme === 'dark'} particleCount={40} grid={false} />
        <ScrollReveal>
          <div className={cn(commonStyles.chatContainer, themeStyles.chatContainer, 'relative z-10')}>
            <BorderBeam size={300} duration={14} borderWidth={1} />

            {/* Header */}
            <header className={cn(commonStyles.header, themeStyles.header)}>
              <div className={commonStyles.headerLeft}>
                <div className={cn(commonStyles.aiAvatar, themeStyles.aiAvatar, isSpeaking && commonStyles.speaking)}>
                  <Image
                    src="/assets/chatbot/chatbot-icon.png"
                    alt="Megi AI"
                    className={commonStyles.avatarImage}
                    width={56}
                    height={56}
                    priority
                  />
                  <div className={cn(commonStyles.avatarPulse, themeStyles.avatarPulse)} />
                </div>
                <div className={commonStyles.headerInfo}>
                  <h2 className={cn(commonStyles.headerTitle, themeStyles.headerTitle)}>
                    Megi AI Assistant
                  </h2>
                  <AIStatusIndicator status={status} variant="badge" showDetails />
                </div>
              </div>

              <div className={commonStyles.headerActions}>
                <button
                  className={cn(commonStyles.iconButton, themeStyles.iconButton)}
                  onClick={clearMessages}
                  title="Clear chat"
                  aria-label="Clear chat history"
                >
                  <Trash2 size={18} />
                </button>
                {recognitionAvailable && (
                  <button
                    className={cn(commonStyles.iconButton, themeStyles.iconButton)}
                    title="Start voice input"
                    onClick={startRecognition}
                  >
                    <Mic size={18} />
                  </button>
                )}
                <button
                  className={cn(commonStyles.iconButton, themeStyles.iconButton)}
                  title="Speak latest response"
                  onClick={() => {
                    const last = [...messages].reverse().find((m) => m.role === 'assistant');
                    if (last) speakText(last.content);
                  }}
                >
                  <Volume2 size={18} />
                </button>
                <div style={{ position: 'relative' }}>
                  <button
                    className={cn(commonStyles.iconButton, themeStyles.iconButton)}
                    onClick={() => setShowActions(!showActions)}
                    title="More options"
                    aria-label="More options"
                  >
                    <MoreVertical size={18} />
                  </button>
                  <AnimatePresence>
                    {showActions && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className={cn(commonStyles.dropdownMenu, themeStyles.dropdownMenu)}
                      >
                        <button className={commonStyles.dropdownItem} onClick={clearMessages}>
                          <Trash2 size={16} /> Clear Chat
                        </button>
                        {recognitionAvailable && (
                          <button className={commonStyles.dropdownItem} onClick={startRecognition}>
                            <Mic size={16} /> Voice Input
                          </button>
                        )}
                        <button
                          className={commonStyles.dropdownItem}
                          onClick={() => {
                            const last = [...messages].reverse().find((m) => m.role === 'assistant');
                            if (last) speakText(last.content);
                          }}
                        >
                          <Volume2 size={16} /> Speak Last
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </header>

            {/* Quick Actions Bar */}
            <AnimatePresence>
              {messages.length <= 1 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={cn(commonStyles.quickActionsBar, themeStyles.quickActionsBar)}
                >
                  <span className={commonStyles.quickActionsLabel}>Quick Prompts:</span>
                  <div className={commonStyles.quickActions}>
                    {QUICK_ACTIONS.map((action, idx) => (
                      <button
                        key={idx}
                        className={cn(commonStyles.quickAction, themeStyles.quickAction)}
                        onClick={() => handleQuickAction(action.query)}
                      >
                        {action.icon}
                        <span>{action.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <div
              ref={messagesContainerRef}
              className={commonStyles.messagesContainer}
              role="log"
              aria-live="polite"
              aria-label="Chat messages"
            >
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className={cn(
                      commonStyles.messageWrapper,
                      msg.role === 'user' ? commonStyles.messageUser : commonStyles.messageBot
                    )}
                  >
                    {/* Avatar */}
                    {msg.role === 'assistant' && (
                      <div
                        className={cn(
                          commonStyles.messageAvatar,
                          themeStyles.messageAvatar,
                          isSpeaking && commonStyles.speaking
                        )}
                      >
                        <Image
                          src="/assets/chatbot/chatbot-icon.png"
                          alt="AI"
                          className={commonStyles.avatarImageSmall}
                          width={32}
                          height={32}
                        />
                      </div>
                    )}

                    {/* Message Content */}
                    <div className={commonStyles.messageContent} style={{ maxWidth: '100%' }}>
                      <div
                        className={cn(
                          commonStyles.messageBubble,
                          msg.role === 'user' ? themeStyles.messageBubbleUser : themeStyles.messageBubbleBot,
                          msg.isError && commonStyles.messageError
                        )}
                      >
                        {/* Text formatting with paragraphs */}
                        <div className={commonStyles.messageText}>
                          {msg.content.split('\n').map((line, i) => (
                            <React.Fragment key={i}>
                              {line}
                              {i < msg.content.split('\n').length - 1 && <br />}
                            </React.Fragment>
                          ))}
                        </div>

                        {/* Structured Tool Results Cards */}
                        {msg.tool_results && msg.tool_results.length > 0 && (
                          <div style={{ marginTop: 8 }}>
                            {msg.tool_results.map((tr, idx) => {
                              if (tr.display_type === 'freelancer_cards') {
                                return (
                                  <FreelancerCardsView
                                    key={idx}
                                    data={tr.data || {}}
                                    onNavigate={(href) => router.push(href)}
                                  />
                                );
                              }
                              if (tr.display_type === 'cost_estimate') {
                                return <CostEstimateView key={idx} data={tr.data || {}} />;
                              }
                              if (tr.display_type === 'market_rates') {
                                return <MarketRatesView key={idx} data={tr.data || {}} />;
                              }
                              if (
                                tr.display_type === 'confirm_post_project' ||
                                tr.display_type === 'confirm_submit_proposal' ||
                                tr.display_type === 'confirm_update_profile'
                              ) {
                                return (
                                  <ConfirmCardView
                                    key={idx}
                                    result={tr}
                                    onConfirmed={(doneMsg, url) => {
                                      const confirmReply: ChatMessage = {
                                        id: `action-${Date.now()}`,
                                        role: 'assistant',
                                        content: doneMsg,
                                        timestamp: new Date(),
                                        action_buttons: url
                                          ? [{ label: 'View Project', href: url, variant: 'primary' }]
                                          : undefined,
                                      };
                                      setMessages((prev) => [...prev, confirmReply]);
                                    }}
                                  />
                                );
                              }
                              return null;
                            })}
                          </div>
                        )}

                        {/* Action Buttons */}
                        {msg.action_buttons && msg.action_buttons.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                            {msg.action_buttons.map((b, idx) => (
                              <button
                                key={idx}
                                style={{
                                  border:
                                    b.variant === 'primary'
                                      ? 'none'
                                      : '1px solid rgba(127,127,127,0.35)',
                                  borderRadius: 8,
                                  padding: '0.4rem 0.75rem',
                                  fontSize: '0.78rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 5,
                                  background:
                                    b.variant === 'primary'
                                      ? 'linear-gradient(135deg,#6366f1,#8b5cf6)'
                                      : 'transparent',
                                  color: b.variant === 'primary' ? '#fff' : 'inherit',
                                }}
                                onClick={() => router.push(b.href)}
                              >
                                <span>{b.label}</span>
                                <ArrowRight size={12} />
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Sentiment badge */}
                        {msg.role === 'assistant' && msg.sentiment && (
                          <span className={cn(commonStyles.sentimentBadge, themeStyles.sentimentBadge)}>
                            {msg.sentiment === 'positive' ? '😊' : msg.sentiment === 'negative' ? '😔' : '😐'}
                          </span>
                        )}
                      </div>

                      {/* Message Meta */}
                      <div className={cn(commonStyles.messageMeta, themeStyles.messageMeta)}>
                        <span className={commonStyles.messageTime}>{formatTime(msg.timestamp)}</span>

                        {msg.role === 'assistant' && !msg.isError && (
                          <div className={commonStyles.messageActions}>
                            <button
                              className={cn(commonStyles.messageAction, themeStyles.messageAction)}
                              onClick={() => handleCopy(msg.content, msg.id)}
                              title="Copy message"
                            >
                              {copiedId === msg.id ? <Check size={12} /> : <Copy size={12} />}
                            </button>
                            <button className={cn(commonStyles.messageAction, themeStyles.messageAction)} title="Helpful">
                              <ThumbsUp size={12} />
                            </button>
                            <button className={cn(commonStyles.messageAction, themeStyles.messageAction)} title="Not helpful">
                              <ThumbsDown size={12} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Suggested Actions */}
                      {msg.role === 'assistant' && msg.suggestions && msg.suggestions.length > 0 && (
                        <div className={commonStyles.suggestions}>
                          {msg.suggestions.map((suggestion, idx) => (
                            <button
                              key={idx}
                              className={cn(commonStyles.suggestionChip, themeStyles.suggestionChip)}
                              onClick={() => handleQuickAction(suggestion)}
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* User Avatar */}
                    {msg.role === 'user' && (
                      <div className={cn(commonStyles.userAvatar, themeStyles.userAvatar)}>
                        <User size={16} />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing Indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={cn(commonStyles.messageWrapper, commonStyles.messageBot)}
                  >
                    <div className={cn(commonStyles.messageAvatar, themeStyles.messageAvatar, isSpeaking && commonStyles.speaking)}>
                      <Image
                        src="/assets/chatbot/chatbot-icon.png"
                        alt="AI"
                        className={commonStyles.avatarImageSmall}
                        width={32}
                        height={32}
                      />
                    </div>
                    <div className={cn(commonStyles.typingIndicator, themeStyles.typingIndicator)}>
                      <div className={commonStyles.typingDots}>
                        <span className={cn(commonStyles.typingDot, themeStyles.typingDot)} />
                        <span className={cn(commonStyles.typingDot, themeStyles.typingDot)} />
                        <span className={cn(commonStyles.typingDot, themeStyles.typingDot)} />
                      </div>
                      <span className={commonStyles.typingText}>Megi is thinking...</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form className={cn(commonStyles.inputForm, themeStyles.inputForm)} onSubmit={handleSubmit}>
              <div className={cn(commonStyles.inputWrapper, themeStyles.inputWrapper)}>
                <input
                  ref={inputRef}
                  type="text"
                  className={cn(commonStyles.input, themeStyles.input)}
                  placeholder="Ask me to find talent, estimate costs, plan project scope, or post a job..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isTyping}
                  aria-label="Type your message"
                />
                <button
                  type="submit"
                  className={cn(
                    commonStyles.sendButton,
                    themeStyles.sendButton,
                    (!input.trim() || isTyping) && commonStyles.sendButtonDisabled
                  )}
                  disabled={!input.trim() || isTyping}
                  aria-label="Send message"
                >
                  <Send size={18} />
                </button>
              </div>

              {/* Mode indicator */}
              <div className={cn(commonStyles.modeIndicator, themeStyles.modeIndicator)}>
                <Sparkles size={12} style={{ color: '#6366f1' }} />
                <span>AI Hiring Concierge & Market Copilot Active</span>
              </div>
            </form>
          </div>
        </ScrollReveal>
      </div>
    </PageTransition>
  );
};

export default ChatbotEnhanced;
