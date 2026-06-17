'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';
import dynamic from 'next/dynamic';
import { apiFetch } from '@/lib/api/core';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  X, Send, Sparkles, Paperclip, ArrowRight,
  ThumbsUp, ThumbsDown, Briefcase, DollarSign,
  Code, Palette, PenTool, Megaphone, Search, User,
  ChevronDown, ChevronUp, Building2, TrendingUp,
  LayoutDashboard, Users,
  CheckCircle2, LogIn, Star,
  Lightbulb, Wallet, Award, BarChart3,
  Globe, Smartphone, Database, Shield, Bot,
  Plus, Maximize2,
} from 'lucide-react';

const RobotModel = dynamic(() => import('./RobotModel'), { ssr: false, loading: () => null });

import commonStyles from './ChatbotAgent.common.module.css';
import lightStyles from './ChatbotAgent.light.module.css';
import darkStyles from './ChatbotAgent.dark.module.css';

// ── Types ──────────────────────────────────────────────────────────────────

type Role = 'client' | 'freelancer' | 'admin' | 'guest';
type ChatStatus = 'online' | 'degraded' | 'offline';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  sentiment?: 'positive' | 'neutral' | 'negative';
  suggestedActions?: SuggestedAction[];
  flowActions?: FlowAction[];
  feedbackGiven?: 'up' | 'down' | null;
  isMarkdown?: boolean;
  isStepSummary?: boolean;
  stepData?: { label: string; value: string }[];
}

interface SuggestedAction {
  icon: React.ElementType;
  text: string;
  variant?: 'primary' | 'secondary';
  action?: string;
  requiresAuth?: boolean;
}

interface FlowAction {
  label: string;
  icon: React.ElementType;
  variant: 'primary' | 'secondary';
  action: string;
  requiresAuth?: boolean;
}

interface FlowStep {
  id: string;
  prompt: string;
  type: 'text' | 'choice' | 'multi-choice';
  choices?: { label: string; value: string; icon?: React.ElementType }[];
  placeholder?: string;
}

interface FlowDefinition {
  id: string;
  name: string;
  steps: FlowStep[];
}

interface ProjectDraft {
  category: string;
  title: string;
  description: string;
  budget: string;
  timeline: string;
  skills: string[];
}

interface PortfolioDraft {
  expertise: string;
  bestProject: string;
  role: string;
  links: string;
}

// ── Constants ──────────────────────────────────────────────────────────────

const PROJECT_CATEGORIES = [
  { label: 'Web Development', value: 'web', icon: Code },
  { label: 'Mobile App', value: 'mobile', icon: Smartphone },
  { label: 'UI/UX Design', value: 'design', icon: Palette },
  { label: 'Writing & Translation', value: 'writing', icon: PenTool },
  { label: 'Marketing', value: 'marketing', icon: Megaphone },
  { label: 'Data & Analytics', value: 'data', icon: BarChart3 },
  { label: 'DevOps & Cloud', value: 'devops', icon: Database },
  { label: 'Cybersecurity', value: 'security', icon: Shield },
];

const BUDGET_OPTIONS = [
  { label: 'Under $500', value: 'under_500' },
  { label: '$500 – $2,000', value: '500_2000' },
  { label: '$2,000 – $5,000', value: '2000_5000' },
  { label: '$5,000+', value: '5000_plus' },
];

const TIMELINE_OPTIONS = [
  { label: '1 Week', value: '1_week' },
  { label: '2 Weeks', value: '2_weeks' },
  { label: '1 Month', value: '1_month' },
  { label: 'Flexible', value: 'flexible' },
];

const SKILL_SUGGESTIONS = [
  'React', 'Node.js', 'Python', 'TypeScript', 'Figma',
  'Swift', 'Kotlin', 'AWS', 'Docker', 'PostgreSQL',
  'GraphQL', 'Next.js', 'Tailwind CSS', 'Flutter', 'Go',
];

const EXPERTISE_CATEGORIES = [
  { label: 'Frontend Development', value: 'frontend', icon: Code },
  { label: 'Backend Development', value: 'backend', icon: Database },
  { label: 'Full-Stack', value: 'fullstack', icon: Globe },
  { label: 'Mobile Development', value: 'mobile', icon: Smartphone },
  { label: 'UI/UX Design', value: 'design', icon: Palette },
  { label: 'Data Science & AI', value: 'data', icon: BarChart3 },
  { label: 'DevOps & Cloud', value: 'devops', icon: Database },
  { label: 'Marketing & SEO', value: 'marketing', icon: Megaphone },
];

const ROLE_QUICK_ACTIONS: Record<Role, SuggestedAction[]> = {
  client: [
    { icon: Briefcase, text: 'Post a Project', variant: 'primary', action: 'flow:post_project', requiresAuth: true },
    { icon: Users, text: 'Find Freelancers', action: 'nav:/client/find-talent' },
    { icon: DollarSign, text: 'Estimate Budget', action: 'flow:estimate_budget' },
    { icon: LayoutDashboard, text: 'My Projects', action: 'nav:/client/dashboard', requiresAuth: true },
    { icon: Wallet, text: 'Payment Help', action: 'topic:payment' },
  ],
  freelancer: [
    { icon: Search, text: 'Find Projects', action: 'nav:/freelancer/browse-projects' },
    { icon: PenTool, text: 'Write Proposal', variant: 'primary', action: 'flow:write_proposal', requiresAuth: true },
    { icon: TrendingUp, text: 'My Earnings', action: 'nav:/freelancer/earnings', requiresAuth: true },
    { icon: Award, text: 'Build Portfolio', variant: 'primary', action: 'flow:build_portfolio', requiresAuth: true },
    { icon: Star, text: 'Improve Profile', action: 'flow:improve_profile', requiresAuth: true },
  ],
  admin: [
    { icon: Shield, text: 'System Health', action: 'nav:/admin/dashboard' },
    { icon: Users, text: 'Manage Users', action: 'nav:/admin/users' },
    { icon: BarChart3, text: 'Analytics', action: 'nav:/admin/analytics' },
  ],
  guest: [
    { icon: Lightbulb, text: 'How it works', action: 'topic:how_it_works' },
    { icon: DollarSign, text: 'Pricing', action: 'topic:pricing' },
    { icon: LogIn, text: 'Sign Up', variant: 'primary', action: 'nav:/signup' },
    { icon: Search, text: 'Browse Projects', action: 'nav:/projects' },
  ],
};

const CONTEXT_SUGGESTIONS: Record<string, string> = {
  '/projects': 'Want me to help you filter projects?',
  '/dashboard': 'Here\u2019s what you can do next',
  '/settings': 'Need help configuring your account?',
  '/client/find-talent': 'Let me help you find the right talent!',
  '/freelancer/browse-projects': 'I can help you narrow down project searches.',
  '/proposals': 'Want me to draft a winning proposal?',
  '/messages': 'Need help managing your conversations?',
  '/admin': 'Need an overview of system health?',
};

// ── Flow Definitions ────────────────────────────────────────────────────────

const POST_PROJECT_FLOW: FlowDefinition = {
  id: 'post_project',
  name: 'Post a Project',
  steps: [
    {
      id: 'category',
      prompt: 'What type of project do you need?',
      type: 'choice',
      choices: PROJECT_CATEGORIES.map(c => ({ label: c.label, value: c.value, icon: c.icon })),
    },
    {
      id: 'title',
      prompt: 'Give your project a title',
      type: 'text',
      placeholder: 'e.g., Build a React e-commerce site',
    },
    {
      id: 'description',
      prompt: 'Describe what you need built',
      type: 'text',
      placeholder: 'Describe the project goals, features, and requirements\u2026',
    },
    {
      id: 'budget',
      prompt: "What\u2019s your budget range?",
      type: 'choice',
      choices: BUDGET_OPTIONS.map(b => ({ label: b.label, value: b.value })),
    },
    {
      id: 'timeline',
      prompt: 'When do you need this done?',
      type: 'choice',
      choices: TIMELINE_OPTIONS.map(t => ({ label: t.label, value: t.value })),
    },
    {
      id: 'skills',
      prompt: 'What skills are required?',
      type: 'multi-choice',
      choices: SKILL_SUGGESTIONS.map(s => ({ label: s, value: s })),
    },
    {
      id: 'review',
      prompt: "I\u2019ll create this project draft for you. Ready to post?",
      type: 'choice',
      choices: [
        { label: 'Yes, post it!', value: 'confirm' },
        { label: 'Let me edit first', value: 'edit' },
      ],
    },
  ],
};

const BUILD_PORTFOLIO_FLOW: FlowDefinition = {
  id: 'build_portfolio',
  name: 'Build Portfolio',
  steps: [
    {
      id: 'expertise',
      prompt: "Let\u2019s build your portfolio! What\u2019s your main expertise?",
      type: 'choice',
      choices: EXPERTISE_CATEGORIES.map(c => ({ label: c.label, value: c.value, icon: c.icon })),
    },
    {
      id: 'bestProject',
      prompt: 'Tell me about your best project',
      type: 'text',
      placeholder: 'Describe the project, its impact, and results\u2026',
    },
    {
      id: 'role',
      prompt: 'What was your role and contribution?',
      type: 'text',
      placeholder: 'e.g., Lead developer, UI designer, project manager\u2026',
    },
    {
      id: 'links',
      prompt: 'Any live links or screenshots?',
      type: 'text',
      placeholder: 'https://my-project.com (or type \u201Cnone\u201D to skip)',
    },
    {
      id: 'review',
      prompt: "Great! I\u2019ve drafted a portfolio entry. Want to add more or publish?",
      type: 'choice',
      choices: [
        { label: 'Publish it', value: 'publish' },
        { label: 'Add another entry', value: 'add_more' },
      ],
    },
  ],
};

const IMPROVE_PROFILE_FLOW: FlowDefinition = {
  id: 'improve_profile',
  name: 'Improve Profile',
  steps: [
    {
      id: 'analyze',
      prompt: 'Let me analyze your profile completeness\u2026',
      type: 'text',
      placeholder: 'Analyzing\u2026',
    },
    {
      id: 'missing_field',
      prompt: '',
      type: 'text',
      placeholder: '',
    },
    {
      id: 'skills',
      prompt: 'Based on your description, I suggest adding these skills:',
      type: 'multi-choice',
      choices: SKILL_SUGGESTIONS.map(s => ({ label: s, value: s })),
    },
    {
      id: 'review',
      prompt: '',
      type: 'choice',
      choices: [
        { label: 'Keep improving', value: 'continue' },
        { label: 'I\u2019m good for now', value: 'done' },
      ],
    },
  ],
};

const WRITE_PROPOSAL_FLOW: FlowDefinition = {
  id: 'write_proposal',
  name: 'Write Proposal',
  steps: [
    {
      id: 'projectUrl',
      prompt: 'Which project are you applying to? Share the project title or paste a link.',
      type: 'text',
      placeholder: 'e.g., Build a React dashboard',
    },
    {
      id: 'relevantExperience',
      prompt: 'What relevant experience do you have for this project?',
      type: 'text',
      placeholder: 'Highlight your relevant past work\u2026',
    },
    {
      id: 'approach',
      prompt: 'How would you approach this project?',
      type: 'text',
      placeholder: 'Describe your plan, timeline, and methodology\u2026',
    },
    {
      id: 'bidAmount',
      prompt: 'What\u2019s your bid amount?',
      type: 'text',
      placeholder: 'e.g., $1,500',
    },
    {
      id: 'review',
      prompt: "Here\u2019s your drafted proposal. Want to submit it?",
      type: 'choice',
      choices: [
        { label: 'Submit proposal', value: 'submit' },
        { label: 'Edit it', value: 'edit' },
      ],
    },
  ],
};

const ESTIMATE_BUDGET_FLOW: FlowDefinition = {
  id: 'estimate_budget',
  name: 'Estimate Budget',
  steps: [
    {
      id: 'projectType',
      prompt: 'What type of project are you planning?',
      type: 'choice',
      choices: PROJECT_CATEGORIES.map(c => ({ label: c.label, value: c.value, icon: c.icon })),
    },
    {
      id: 'complexity',
      prompt: 'How complex is the project?',
      type: 'choice',
      choices: [
        { label: 'Simple \u2013 small scope, basic features', value: 'simple' },
        { label: 'Moderate \u2013 standard features, some customization', value: 'moderate' },
        { label: 'Complex \u2013 advanced features, integrations', value: 'complex' },
      ],
    },
    {
      id: 'timeline',
      prompt: 'What\u2019s your ideal timeline?',
      type: 'choice',
      choices: TIMELINE_OPTIONS.map(t => ({ label: t.label, value: t.value })),
    },
  ],
};

const ALL_FLOWS: Record<string, FlowDefinition> = {
  post_project: POST_PROJECT_FLOW,
  build_portfolio: BUILD_PORTFOLIO_FLOW,
  improve_profile: IMPROVE_PROFILE_FLOW,
  write_proposal: WRITE_PROPOSAL_FLOW,
  estimate_budget: ESTIMATE_BUDGET_FLOW,
};

// ── Component ──────────────────────────────────────────────────────────────

export default function ChatbotAgent() {
  const { resolvedTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const themeStyles = resolvedTheme === 'light' ? lightStyles : darkStyles;

  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, _setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatStatus, setChatStatus] = useState<ChatStatus>('online');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [activeFlow, setActiveFlow] = useState<string | null>(null);
  const [flowStepIndex, setFlowStepIndex] = useState(0);
  const [flowData, setFlowData] = useState<Record<string, string>>({});
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [collapsedSummaries, setCollapsedSummaries] = useState<Record<number, boolean>>({});
  const [proactiveSuggestion, setProactiveSuggestion] = useState<string | null>(null);
  const [showProactiveChip, setShowProactiveChip] = useState(false);

  const [guestRole, setGuestRole] = useState<Role>('guest');
  const [onboardingPhase, setOnboardingPhase] = useState<'role_select' | 'chatting' | null>(null);

  const proactiveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const proactiveTriggeredRef = useRef(false);

  const userRole: Role = useMemo(() => {
    if (isAuthenticated && user) {
      return user.user_type === 'admin' ? 'admin' : user.user_type;
    }
    return guestRole;
  }, [isAuthenticated, user, guestRole]);

  const profileCompleted = useMemo(() => {
    if (!user) return false;
    return !!user.profile_completed && !!user.bio && !!user.title;
  }, [user]);

  const profileCompletenessScore = useMemo(() => {
    if (!user) return 0;
    const fields = [
      !!user.name,
      !!user.bio,
      !!user.title,
      !!user.location,
      !!user.skills,
      !!user.hourly_rate,
      !!user.profile_image_url,
      !!user.is_verified,
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  }, [user]);

  const missingProfileFields = useMemo(() => {
    if (!user) return ['name', 'bio', 'title', 'location', 'skills', 'hourly_rate'];
    const missing: string[] = [];
    if (!user.name) missing.push('name');
    if (!user.bio) missing.push('bio');
    if (!user.title) missing.push('title');
    if (!user.location) missing.push('location');
    if (!user.skills) missing.push('skills');
    if (!user.hourly_rate) missing.push('hourly_rate');
    return missing;
  }, [user]);

  const improveProfileStepIndexRef = useRef(0);

  // ── Sound Effects ──────────────────────────────────────────────────────

  const playSound = useCallback((type: 'open' | 'close' | 'send' | 'receive' | 'step_complete') => {
    if (typeof window === 'undefined') return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      const now = audioCtx.currentTime;
      switch (type) {
        case 'open':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(400, now);
          oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.1);
          gainNode.gain.setValueAtTime(0, now);
          gainNode.gain.linearRampToValueAtTime(0.1, now + 0.05);
          gainNode.gain.linearRampToValueAtTime(0, now + 0.15);
          oscillator.start(now);
          oscillator.stop(now + 0.15);
          break;
        case 'close':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(800, now);
          oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.1);
          gainNode.gain.setValueAtTime(0, now);
          gainNode.gain.linearRampToValueAtTime(0.05, now + 0.05);
          gainNode.gain.linearRampToValueAtTime(0, now + 0.15);
          oscillator.start(now);
          oscillator.stop(now + 0.15);
          break;
        case 'send':
          oscillator.type = 'triangle';
          oscillator.frequency.setValueAtTime(600, now);
          gainNode.gain.setValueAtTime(0, now);
          gainNode.gain.linearRampToValueAtTime(0.05, now + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
          oscillator.start(now);
          oscillator.stop(now + 0.1);
          break;
        case 'receive':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(500, now);
          oscillator.frequency.setValueAtTime(700, now + 0.1);
          gainNode.gain.setValueAtTime(0, now);
          gainNode.gain.linearRampToValueAtTime(0.1, now + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          oscillator.start(now);
          oscillator.stop(now + 0.2);
          break;
        case 'step_complete':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(523.25, now);
          oscillator.frequency.setValueAtTime(659.25, now + 0.08);
          oscillator.frequency.setValueAtTime(783.99, now + 0.16);
          gainNode.gain.setValueAtTime(0, now);
          gainNode.gain.linearRampToValueAtTime(0.08, now + 0.04);
          gainNode.gain.linearRampToValueAtTime(0.08, now + 0.16);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          oscillator.start(now);
          oscillator.stop(now + 0.3);
          break;
      }
    } catch {
      // Audio not supported
    }
  }, []);

  // ── Magnetic mouse tracking ───────────────────────────────────────────

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-50, 50], [10, -10]), { damping: 20, stiffness: 200 });
  const rotateY = useSpring(useTransform(mouseX, [-50, 50], [-10, 10]), { damping: 20, stiffness: 200 });

  const handleButtonMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - (rect.left + rect.width / 2));
    mouseY.set(e.clientY - (rect.top + rect.height / 2));
  };

  const handleButtonMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  // ── Proactive Engagement ──────────────────────────────────────────────

  useEffect(() => {
    if (!mounted || isOpen || proactiveTriggeredRef.current) return;
    const contextualMsg = pathname ? CONTEXT_SUGGESTIONS[pathname] : null;
    proactiveTimerRef.current = setTimeout(() => {
      proactiveTriggeredRef.current = true;
      if (contextualMsg) {
        setProactiveSuggestion(contextualMsg);
      } else {
        setProactiveSuggestion('Hi! I\u2019m MegiBot \u2014 your AI assistant. Need help?');
      }
      setShowProactiveChip(true);
      setTimeout(() => setShowProactiveChip(false), 8000);
    }, 10000);
    return () => {
      if (proactiveTimerRef.current) clearTimeout(proactiveTimerRef.current);
    };
  }, [pathname, isOpen, mounted]);

  // ── Helpers ────────────────────────────────────────────────────────────

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const addBotMessage = useCallback((text: string, extras?: Partial<Message>) => {
    const msg: Message = {
      id: Date.now() + Math.random(),
      text,
      sender: 'bot',
      timestamp: new Date(),
      isMarkdown: true,
      ...extras,
    };
    setMessages(prev => [...prev, msg]);
    return msg.id;
  }, []);

  const addUserMessage = useCallback((text: string) => {
    const msg: Message = {
      id: Date.now() + Math.random(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, msg]);
  }, []);

  // ── Flow Engine ───────────────────────────────────────────────────────

  const startFlow = useCallback((flowId: string) => {
    if (!isAuthenticated && (flowId === 'post_project' || flowId === 'write_proposal' || flowId === 'build_portfolio' || flowId === 'improve_profile')) {
      addBotMessage("You\u2019ll need to sign in first. Let me take you there \u2192", {
        flowActions: [{ label: 'Sign In', icon: LogIn, variant: 'primary', action: 'nav:/login' }],
      });
      return;
    }
    const flow = ALL_FLOWS[flowId];
    if (!flow) return;
    setActiveFlow(flowId);
    setFlowStepIndex(0);
    setFlowData({});
    setSelectedSkills([]);
    if (flowId === 'improve_profile') {
      improveProfileStepIndexRef.current = 0;
      const score = profileCompletenessScore;
      const missing = missingProfileFields;
      if (missing.length === 0) {
        addBotMessage(`Your profile is looking great at **${score}%** completeness! You\u2019re all set.`, {
          suggestedActions: getQuickActions(),
        });
        setActiveFlow(null);
        return;
      }
      const fieldLabels: Record<string, string> = {
        name: 'Full Name',
        bio: 'Bio / About',
        title: 'Professional Title',
        location: 'Location',
        skills: 'Skills',
        hourly_rate: 'Hourly Rate',
      };
      const missingLabels = missing.map(f => fieldLabels[f] || f).join(', ');
      const step = flow.steps[0];
      addBotMessage(`${step.prompt}\n\n**Score: ${score}%** \u2014 Missing: ${missingLabels}`, {
        suggestedActions: getQuickActions(),
      });

      const firstMissing = missing[0];
      const nextStep = { ...flow.steps[1], prompt: `Let\u2019s work on your **${fieldLabels[firstMissing] || firstMissing}**. What would you like to set?` };
      setTimeout(() => {
        addBotMessage(nextStep.prompt);
        setFlowStepIndex(1);
        setFlowData(prev => ({ ...prev, currentField: firstMissing }));
      }, 800);
      return;
    }
    const step = flow.steps[0];
    addBotMessage(step.prompt, {
      suggestedActions: step.type === 'choice' || step.type === 'multi-choice'
        ? (step.choices || []).map(c => ({
            icon: c.icon || ArrowRight,
            text: c.label,
            action: `flow_choice:${c.value}`,
          }))
        : undefined,
    });
    playSound('step_complete');
  }, [isAuthenticated, profileCompletenessScore, missingProfileFields, addBotMessage, playSound]);

  const advanceFlow = useCallback((stepId: string, value: string) => {
    const flowId = activeFlow;
    if (!flowId) return;
    const flow = ALL_FLOWS[flowId];
    if (!flow) return;

    setFlowData(prev => ({ ...prev, [stepId]: value }));
    playSound('step_complete');

    if (flowId === 'improve_profile') {
      const _currentField = flowData.currentField || missingProfileFields[0];
      improveProfileStepIndexRef.current++;
      const nextIdx = improveProfileStepIndexRef.current;
      if (nextIdx < missingProfileFields.length) {
        const nextField = missingProfileFields[nextIdx];
        const fieldLabels: Record<string, string> = {
          name: 'Full Name', bio: 'Bio / About', title: 'Professional Title',
          location: 'Location', skills: 'Skills', hourly_rate: 'Hourly Rate',
        };
        setFlowData(prev => ({ ...prev, currentField: nextField }));
        addBotMessage(`Got it! Now let\u2019s add your **${fieldLabels[nextField] || nextField}**:`);
      } else {
        setFlowStepIndex(2);
        addBotMessage('Based on your description, I suggest adding these skills:', {
          suggestedActions: SKILL_SUGGESTIONS.map(s => ({
            icon: Sparkles,
            text: s,
            action: `flow_skill:${s}`,
          })),
        });
      }
      return;
    }

    const nextIndex = flowStepIndex + 1;
    if (nextIndex >= flow.steps.length) {
      setActiveFlow(null);
      return;
    }

    if (stepId === 'skills' || (flowId === 'post_project' && stepId === 'skills')) {
      setFlowData(prev => ({ ...prev, skills: selectedSkills.join(', ') }));
    }

    setFlowStepIndex(nextIndex);

    if (flowId === 'post_project' && nextIndex === flow.steps.length - 1) {
      const draft: ProjectDraft = {
        category: flowData.category || value,
        title: flowData.title || '',
        description: flowData.description || '',
        budget: flowData.budget || '',
        timeline: flowData.timeline || '',
        skills: selectedSkills.length > 0 ? selectedSkills : (flowData.skills || '').split(', '),
      };
      const catLabel = PROJECT_CATEGORIES.find(c => c.value === draft.category)?.label || draft.category;
      const budgetLabel = BUDGET_OPTIONS.find(b => b.value === draft.budget)?.label || draft.budget;
      const timelineLabel = TIMELINE_OPTIONS.find(t => t.value === draft.timeline)?.label || draft.timeline;
      addBotMessage("Here\u2019s your project summary:", {
        isStepSummary: true,
        stepData: [
          { label: 'Category', value: catLabel },
          { label: 'Title', value: draft.title },
          { label: 'Description', value: draft.description },
          { label: 'Budget', value: budgetLabel },
          { label: 'Timeline', value: timelineLabel },
          { label: 'Skills', value: draft.skills.join(', ') || 'None specified' },
        ],
        flowActions: [
          { label: 'Post Project \u2192', icon: Briefcase, variant: 'primary', action: 'submit_project', requiresAuth: true },
          { label: 'Edit', icon: PenTool, variant: 'secondary', action: 'flow:post_project' },
        ],
      });
      return;
    }

    if (flowId === 'build_portfolio' && nextIndex === flow.steps.length - 1) {
      const draft: PortfolioDraft = {
        expertise: flowData.expertise || '',
        bestProject: flowData.bestProject || '',
        role: flowData.role || '',
        links: flowData.links || '',
      };
      const expLabel = EXPERTISE_CATEGORIES.find(c => c.value === draft.expertise)?.label || draft.expertise;
      addBotMessage("I\u2019ve drafted a portfolio entry for you:", {
        isStepSummary: true,
        stepData: [
          { label: 'Expertise', value: expLabel },
          { label: 'Best Project', value: draft.bestProject },
          { label: 'Role', value: draft.role },
          { label: 'Links', value: draft.links || 'None' },
        ],
        flowActions: [
          { label: 'Publish \u2192', icon: Award, variant: 'primary', action: 'publish_portfolio', requiresAuth: true },
          { label: 'Add Another', icon: Plus, variant: 'secondary', action: 'flow:build_portfolio' },
        ],
      });
      return;
    }

    if (flowId === 'write_proposal' && nextIndex === flow.steps.length - 1) {
      const proposalData = {
        project: flowData.projectUrl || '',
        experience: flowData.relevantExperience || '',
        approach: flowData.approach || '',
        bid: flowData.bidAmount || '',
      };
      addBotMessage("Here\u2019s your drafted proposal:", {
        isStepSummary: true,
        stepData: [
          { label: 'Project', value: proposalData.project },
          { label: 'Experience', value: proposalData.experience },
          { label: 'Approach', value: proposalData.approach },
          { label: 'Bid', value: proposalData.bid },
        ],
        flowActions: [
          { label: 'Submit Proposal \u2192', icon: Send, variant: 'primary', action: 'submit_proposal', requiresAuth: true },
          { label: 'Edit', icon: PenTool, variant: 'secondary', action: 'flow:write_proposal' },
        ],
      });
      return;
    }

    if (flowId === 'estimate_budget' && nextIndex >= flow.steps.length - 1) {
      const estimates: Record<string, Record<string, Record<string, string>>> = {
        web: {
          simple: { '1_week': '$300\u2013$800', '2_weeks': '$500\u2013$1,500', '1_month': '$1,000\u2013$3,000', flexible: '$800\u2013$2,500' },
          moderate: { '1_week': '$1,000\u2013$3,000', '2_weeks': '$2,000\u2013$5,000', '1_month': '$3,000\u2013$8,000', flexible: '$2,500\u2013$7,000' },
          complex: { '1_week': '$3,000\u2013$8,000', '2_weeks': '$5,000\u2013$15,000', '1_month': '$8,000\u2013$25,000', flexible: '$7,000\u2013$20,000' },
        },
        mobile: {
          simple: { '1_week': '$500\u2013$1,500', '2_weeks': '$1,000\u2013$3,000', '1_month': '$2,000\u2013$6,000', flexible: '$1,500\u2013$5,000' },
          moderate: { '1_week': '$2,000\u2013$5,000', '2_weeks': '$3,000\u2013$8,000', '1_month': '$5,000\u2013$15,000', flexible: '$4,000\u2013$12,000' },
          complex: { '1_week': '$5,000\u2013$12,000', '2_weeks': '$8,000\u2013$20,000', '1_month': '$15,000\u2013$40,000', flexible: '$12,000\u2013$30,000' },
        },
      };
      const defaultEst: Record<string, Record<string, string>> = {
        simple: { '1_week': '$300\u2013$1,000', '2_weeks': '$500\u2013$2,000', '1_month': '$1,000\u2013$4,000', flexible: '$800\u2013$3,000' },
        moderate: { '1_week': '$1,000\u2013$3,000', '2_weeks': '$2,000\u2013$6,000', '1_month': '$4,000\u2013$12,000', flexible: '$3,000\u2013$10,000' },
        complex: { '1_week': '$3,000\u2013$10,000', '2_weeks': '$5,000\u2013$20,000', '1_month': '$10,000\u2013$35,000', flexible: '$8,000\u2013$30,000' },
      };
      const catEst = estimates[flowData.projectType || 'web'] || defaultEst;
      const complexity = flowData.complexity || 'moderate';
      const timeline = flowData.timeline || 'flexible';
      const range = (catEst[complexity] || defaultEst[complexity])?.[timeline] || defaultEst.moderate.flexible;
      addBotMessage(`Based on your selections, here\u2019s the estimated budget:\n\n**${range}**\n\nThis is a market-rate estimate. Actual costs may vary based on specific requirements.`, {
        suggestedActions: [
          { icon: Briefcase, text: 'Post a project in this range', action: 'flow:post_project', requiresAuth: true },
          { icon: Search, text: 'Find freelancers in budget', action: 'nav:/client/find-talent' },
        ],
      });
      setActiveFlow(null);
      return;
    }

    const nextStep = flow.steps[nextIndex];
    if (!nextStep) {
      setActiveFlow(null);
      return;
    }

    let suggested: SuggestedAction[] | undefined;
    if (nextStep.type === 'choice' || nextStep.type === 'multi-choice') {
      suggested = (nextStep.choices || []).map(c => ({
        icon: c.icon || ArrowRight,
        text: c.label,
        action: nextStep.type === 'multi-choice'
          ? `flow_skill:${c.value}`
          : `flow_choice:${c.value}`,
      }));
      if (nextStep.type === 'multi-choice' && selectedSkills.length > 0) {
        suggested = [
          ...suggested,
          { icon: CheckCircle2, text: `Done (${selectedSkills.length} selected)`, action: 'flow_skills_done', variant: 'primary' },
        ];
      }
    }
    addBotMessage(nextStep.prompt, { suggestedActions: suggested });
  }, [activeFlow, flowStepIndex, flowData, selectedSkills, missingProfileFields, addBotMessage, playSound, profileCompletenessScore]);

  const handleFlowChoice = useCallback((choiceValue: string) => {
    if (!activeFlow) return;
    const flow = ALL_FLOWS[activeFlow];
    if (!flow) return;

    if (activeFlow === 'post_project' || activeFlow === 'estimate_budget' || activeFlow === 'build_portfolio' || activeFlow === 'write_proposal') {
      const step = flow.steps[flowStepIndex];
      addUserMessage(choiceValue);
      setTimeout(() => advanceFlow(step.id, choiceValue), 400);
    }
  }, [activeFlow, flowStepIndex, addUserMessage, advanceFlow]);

  const handleFlowSkillToggle = useCallback((skill: string) => {
    setSelectedSkills(prev => {
      const next = prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill];
      return next;
    });
  }, []);

  const handleFlowSkillsDone = useCallback(() => {
    if (!activeFlow) return;
    const flow = ALL_FLOWS[activeFlow];
    if (!flow) return;
    const step = flow.steps[flowStepIndex];
    addUserMessage(selectedSkills.join(', '));
    setTimeout(() => advanceFlow(step.id, selectedSkills.join(', ')), 400);
  }, [activeFlow, flowStepIndex, selectedSkills, addUserMessage, advanceFlow]);

  // ── Quick Actions ─────────────────────────────────────────────────────

  const getQuickActions = useCallback((): SuggestedAction[] => {
    return ROLE_QUICK_ACTIONS[userRole] || ROLE_QUICK_ACTIONS.guest;
  }, [userRole]);

  // ── Onboarding Greeting ───────────────────────────────────────────────

  const buildGreeting = useCallback((): { text: string; actions: SuggestedAction[] } => {
    if (!isAuthenticated) {
      setOnboardingPhase('role_select');
      return {
        text: "Welcome to **MegiLance**! I\u2019m MegiBot, your AI assistant.\n\nTo give you the best experience, tell me \u2014 are you looking to **hire** or **find work**?",
        actions: [
          { icon: Building2, text: 'I\u2019m a Client', variant: 'primary', action: 'guest_role:client' },
          { icon: User, text: 'I\u2019m a Freelancer', variant: 'primary', action: 'guest_role:freelancer' },
        ],
      };
    }
    if (user && !profileCompleted) {
      const score = profileCompletenessScore;
      return {
        text: `Hey **${user.name || 'there'}**! Your profile is **${score}%** complete. Let me help you finish it so you can unlock all features.`,
        actions: [
          { icon: Star, text: 'Complete My Profile', variant: 'primary', action: 'flow:improve_profile', requiresAuth: true },
          { icon: LayoutDashboard, text: 'Go to Dashboard', action: `nav:/${userRole}/dashboard` },
        ],
      };
    }
    const name = user?.name || 'there';
    return {
      text: `Hey **${name}**! Welcome back. How can I help you today?`,
      actions: getQuickActions(),
    };
  }, [isAuthenticated, user, profileCompleted, profileCompletenessScore, userRole, getQuickActions]);

  // ── Start Conversation ─────────────────────────────────────────────────

  const startConversation = useCallback(async () => {
    setIsLoading(true);
    setIsTyping(true);

    if (isAuthenticated && user) {
      try {
        const res = await apiFetch<{ conversation_id: string; response: string }>(
          '/chatbot/start',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: user.id,
              role: user.user_type,
              name: user.name,
              email: user.email,
              profile_completed: user.profile_completed,
            }),
          },
        );
        setConversationId(res.conversation_id);
        setOnboardingPhase('chatting');
        const greeting = buildGreeting();
        addBotMessage(greeting.text, { suggestedActions: greeting.actions });
      } catch {
        setConversationId('offline-' + Date.now());
        const greeting = buildGreeting();
        addBotMessage(greeting.text, { suggestedActions: greeting.actions });
      }
    } else {
      try {
        const res = await apiFetch<{ conversation_id: string; response: string }>(
          '/chatbot/start',
          { method: 'POST' },
        );
        setConversationId(res.conversation_id);
      } catch {
        setConversationId('offline-' + Date.now());
      }
      const greeting = buildGreeting();
      addBotMessage(greeting.text, { suggestedActions: greeting.actions });
    }

    setIsLoading(false);
    setIsTyping(false);
  }, [isAuthenticated, user, addBotMessage, buildGreeting]);

  // ── Offline Pattern Matching ───────────────────────────────────────────

  const getOfflineResponse = useCallback((msg: string): { text: string; sentiment: string; suggestedActions?: SuggestedAction[] } => {
    const lower = msg.toLowerCase();

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      const actions = getQuickActions();
      return { text: "Hello! How can I help you today?", sentiment: 'positive', suggestedActions: actions };
    }
    if (lower.includes('how it works') || lower.includes('how does')) {
      return {
        text: "Here\u2019s how MegiLance works:\n\n1. **Clients** post projects with details & budget\n2. **Freelancers** browse and submit proposals\n3. Clients review proposals, interview, and hire\n4. Work is delivered through our secure platform\n5. **Payment** is released when you\u2019re satisfied\n\nPayments are secured with **escrow** and support **USDC on Polygon**!",
        sentiment: 'positive',
        suggestedActions: [
          { icon: LogIn, text: 'Sign Up Free', action: 'nav:/signup', variant: 'primary' },
          { icon: Search, text: 'Browse Projects', action: 'nav:/projects' },
        ],
      };
    }
    if (lower.includes('pricing') || lower.includes('fee') || lower.includes('cost')) {
      return {
        text: "### MegiLance Pricing\n\n**For Clients:**\n- Posting projects: **Free**\n- Hiring: **0% fee**\n\n**For Freelancers:**\n- Standard plan: **8% service fee**\n- Premium plan: **5% service fee**\n\nCompare that to **20%+** on other platforms! Plus, all AI features are free right now.",
        sentiment: 'positive',
        suggestedActions: [
          { icon: DollarSign, text: 'Payment Info', action: 'topic:payment' },
          { icon: LogIn, text: 'Sign Up', action: 'nav:/signup' },
        ],
      };
    }
    if (lower.includes('payment') || lower.includes('pay') || lower.includes('usdc')) {
      return {
        text: "MegiLance supports:\n\n- **USDC stablecoin** on Polygon network\n- **Escrow protection** for both parties\n- **Low fees** (< 1% transaction cost)\n- **Instant settlements** via blockchain\n\nYour money is always safe and transparent!",
        sentiment: 'positive',
      };
    }
    if (lower.includes('find freelancer') || lower.includes('hire')) {
      return {
        text: "To find freelancers:\n1. Go to **Talent Directory** from the menu\n2. Filter by skill, rating, or hourly rate\n3. Review profiles and portfolios\n4. Send a message or invite to a project!",
        sentiment: 'positive',
        suggestedActions: [
          { icon: Users, text: 'Find Talent', action: 'nav:/client/find-talent' },
        ],
      };
    }
    if (lower.includes('post') && (lower.includes('project') || lower.includes('job'))) {
      return {
        text: "I can guide you through posting a project step-by-step! Just click the button below to start.",
        sentiment: 'positive',
        suggestedActions: [
          { icon: Briefcase, text: 'Post a Project \u2192', action: 'flow:post_project', variant: 'primary', requiresAuth: true },
        ],
      };
    }
    if (lower.includes('proposal') || lower.includes('bid')) {
      return {
        text: "To write a winning proposal:\n1. **Personalize** every bid for the specific project\n2. **Highlight** relevant past work\n3. **Address** the client\u2019s specific problems\n4. **Propose** a clear timeline and budget\n5. **Show enthusiasm** and understanding\n\nI can help you draft one!",
        sentiment: 'positive',
        suggestedActions: [
          { icon: PenTool, text: 'Write Proposal \u2192', action: 'flow:write_proposal', variant: 'primary', requiresAuth: true },
        ],
      };
    }
    if (lower.includes('tips') || lower.includes('advice') || lower.includes('success')) {
      return {
        text: "Quick tips for success:\n- Complete your profile **100%**\n- Add a professional **portfolio**\n- Respond to messages within **24 hours**\n- Ask **clarifying questions** before bidding\n- Deliver quality work **on time**\n- Maintain a **5-star rating**",
        sentiment: 'positive',
      };
    }
    if (lower.includes('profile') || lower.includes('improve')) {
      return {
        text: "I can analyze your profile and guide you through improvements step by step!",
        sentiment: 'positive',
        suggestedActions: [
          { icon: Star, text: 'Improve Profile \u2192', action: 'flow:improve_profile', variant: 'primary', requiresAuth: true },
        ],
      };
    }
    if (lower.includes('portfolio')) {
      return {
        text: "A strong portfolio is key to winning projects! I can help you build one step-by-step.",
        sentiment: 'positive',
        suggestedActions: [
          { icon: Award, text: 'Build Portfolio \u2192', action: 'flow:build_portfolio', variant: 'primary', requiresAuth: true },
        ],
      };
    }
    if (lower.includes('budget') || lower.includes('estimate') || lower.includes('cost')) {
      return {
        text: "I can help you estimate a project budget! Let me guide you through it.",
        sentiment: 'positive',
        suggestedActions: [
          { icon: DollarSign, text: 'Estimate Budget \u2192', action: 'flow:estimate_budget', variant: 'primary' },
        ],
      };
    }
    if (lower.includes('match') || lower.includes('job for me') || lower.includes('relevant')) {
      return {
        text: "I can help find relevant projects! In full AI mode, I analyze your skills and activity to recommend the best matches. For now, try browsing our project directory!",
        sentiment: 'positive',
        suggestedActions: [
          { icon: Search, text: 'Browse Projects', action: 'nav:/projects' },
        ],
      };
    }

    const offlineMsg = chatStatus === 'offline'
      ? "I\u2019m not connected right now. I can help with basic questions \u2014 try asking about getting started, pricing, payments, or finding projects."
      : "I don\u2019t have a specific answer for that. Try asking about getting started, posting a project, pricing, or finding freelancers!";
    return {
      text: offlineMsg,
      sentiment: 'neutral',
      suggestedActions: getQuickActions(),
    };
  }, [chatStatus, getQuickActions]);

  // ── Send Message ──────────────────────────────────────────────────────

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || !conversationId) return;

    addUserMessage(trimmed);
    playSound('send');
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    if (activeFlow) {
      const flow = ALL_FLOWS[activeFlow];
      if (flow) {
        const step = flow.steps[flowStepIndex];
        setTimeout(() => advanceFlow(step.id, trimmed), 500);
      }
      setIsLoading(false);
      setIsTyping(false);
      return;
    }

    try {
      let data: { response: string; sentiment?: string; suggested_actions?: string[] };
      try {
        const res = await apiFetch<{ response: string; sentiment?: string; suggested_actions?: string[] }>(
          `/${conversationId}/message`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: trimmed }),
          },
        );
        data = res;
      } catch {
        data = {
          response: getOfflineResponse(trimmed).text,
          sentiment: getOfflineResponse(trimmed).sentiment,
          suggested_actions: getOfflineResponse(trimmed).suggestedActions?.map(a => a.text),
        };
        setChatStatus('degraded');
      }

      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100));

      const offlineActions = getOfflineResponse(trimmed).suggestedActions;
      addBotMessage(data.response, {
        sentiment: (data.sentiment as 'positive' | 'neutral' | 'negative') || 'neutral',
        suggestedActions: offlineActions,
      });
      if (!isOpen) setUnreadCount(prev => prev + 1);
      playSound('receive');
    } catch {
      const offlineData = getOfflineResponse(trimmed);
      addBotMessage(offlineData.text, {
        sentiment: offlineData.sentiment as any,
        suggestedActions: offlineData.suggestedActions,
      });
      if (!isOpen) setUnreadCount(prev => prev + 1);
      playSound('receive');
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  }, [inputValue, conversationId, activeFlow, flowStepIndex, addUserMessage, addBotMessage, playSound, advanceFlow, getOfflineResponse, isOpen]);

  // ── Handle Action ─────────────────────────────────────────────────────

  const handleAction = useCallback((action: string, requiresAuth?: boolean) => {
    if (requiresAuth && !isAuthenticated) {
      addBotMessage("You\u2019ll need to sign in first. Let me take you there \u2192", {
        flowActions: [{ label: 'Sign In', icon: LogIn, variant: 'primary', action: 'nav:/login' }],
      });
      return;
    }

    if (action.startsWith('flow:')) {
      const flowId = action.slice(5);
      startFlow(flowId);
      return;
    }

    if (action.startsWith('flow_choice:')) {
      const value = action.slice(12);
      handleFlowChoice(value);
      return;
    }

    if (action.startsWith('flow_skill:')) {
      const skill = action.slice(11);
      handleFlowSkillToggle(skill);
      return;
    }

    if (action === 'flow_skills_done') {
      handleFlowSkillsDone();
      return;
    }

    if (action.startsWith('guest_role:')) {
      const role = action.slice(11) as Role;
      setGuestRole(role);
      setOnboardingPhase('chatting');
      const name = role === 'client' ? 'Client' : 'Freelancer';
      const actions = ROLE_QUICK_ACTIONS[role];
      addBotMessage(`Great choice, **${name}**! Here\u2019s what I can help you with:`, {
        suggestedActions: actions,
      });
      return;
    }

    if (action.startsWith('nav:')) {
      const path = action.slice(4);
      addBotMessage(`Taking you there now\u2026`);
      setTimeout(() => {
        router.push(path);
      }, 500);
      return;
    }

    if (action.startsWith('topic:')) {
      const topic = action.slice(6);
      const offlineResp = getOfflineResponse(topic === 'how_it_works' ? 'how does megilance work' : topic === 'pricing' ? 'pricing fees' : topic);
      addBotMessage(offlineResp.text, {
        suggestedActions: offlineResp.suggestedActions,
      });
      return;
    }

    if (action === 'submit_project') {
      addBotMessage("Your project has been submitted! You\u2019ll start receiving proposals soon. I\u2019ll notify you when there are new matches.", {
        suggestedActions: [
          { icon: LayoutDashboard, text: 'View My Projects', action: 'nav:/client/dashboard' },
          { icon: Sparkles, text: 'Something else', action: 'clear_flow' },
        ],
      });
      setActiveFlow(null);
      return;
    }

    if (action === 'publish_portfolio') {
      addBotMessage("Portfolio entry published! Your profile just got stronger. Want to add another entry or do something else?", {
        suggestedActions: [
          { icon: Award, text: 'Add Another', action: 'flow:build_portfolio', requiresAuth: true },
          { icon: User, text: 'View Profile', action: `nav:/${userRole}/profile` },
        ],
      });
      setActiveFlow(null);
      return;
    }

    if (action === 'submit_proposal') {
      addBotMessage("Proposal submitted! The client will review it shortly. Here are some next steps:", {
        suggestedActions: [
          { icon: Search, text: 'Find More Projects', action: 'nav:/freelancer/browse-projects' },
          { icon: LayoutDashboard, text: 'Go to Dashboard', action: 'nav:/freelancer/dashboard' },
        ],
      });
      setActiveFlow(null);
      return;
    }

    if (action === 'clear_flow') {
      setActiveFlow(null);
      addBotMessage("What else can I help you with?", { suggestedActions: getQuickActions() });
      return;
    }

    if (action === 'edit') {
      startFlow(activeFlow || 'post_project');
      return;
    }

    addUserMessage(action);
    setIsTyping(true);
    setTimeout(() => {
      const resp = getOfflineResponse(action);
      addBotMessage(resp.text, { suggestedActions: resp.suggestedActions });
      setIsTyping(false);
      playSound('receive');
    }, 500);
  }, [isAuthenticated, addBotMessage, startFlow, handleFlowChoice, handleFlowSkillToggle, handleFlowSkillsDone, router, getOfflineResponse, getQuickActions, activeFlow, playSound, userRole]);

  // ── Feedback ──────────────────────────────────────────────────────────

  const handleFeedback = useCallback((messageId: number, type: 'up' | 'down') => {
    setMessages(prev => prev.map(m =>
      m.id === messageId ? { ...m, feedbackGiven: type } : m
    ));
  }, []);

  // ── Toggle & Lifecycle ────────────────────────────────────────────────

  const toggleChatbot = useCallback(() => {
    if (isOpen) {
      playSound('close');
      setIsOpen(false);
    } else {
      playSound('open');
      setIsOpen(true);
      setUnreadCount(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, playSound]);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 4000);
        const res = await fetch('/api/v1/health', { method: 'HEAD', signal: controller.signal });
        clearTimeout(tid);
        if (res.status === 503 || res.status === 500) setChatStatus('degraded');
        else if (!res.ok && res.status !== 404 && res.status !== 405) setChatStatus('degraded');
      } catch {
        setChatStatus('degraded');
      }
    };
    checkHealth();
  }, []);

  useEffect(() => {
    if (isOpen && !conversationId) startConversation();
    if (isOpen) {
      setUnreadCount(0);
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => { scrollToBottom(); }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.sender === 'bot') setUnreadCount(prev => prev + 1);
    }
  }, [messages.length]);

  // ── User avatar fallback ──────────────────────────────────────────────

  const userInitials = useMemo(() => {
    if (!user?.name) return '?';
    return user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }, [user]);

  // ── Render: Loading State ──────────────────────────────────────────────

  if (!mounted) {
    return (
      <div className={commonStyles.chatbotContainer}>
        <button className={cn(commonStyles.toggleButton, lightStyles.toggleButton)} aria-label="Loading chat" disabled>
          <RobotModel size={48} />
        </button>
      </div>
    );
  }

  const activeFlowDef = activeFlow ? ALL_FLOWS[activeFlow] : null;
  const flowProgress = activeFlowDef ? ((flowStepIndex + 1) / activeFlowDef.steps.length) * 100 : 0;

  // ── Render: Flow Cards ─────────────────────────────────────────────────

  const renderFlowCards = (choices: { label: string; value: string; icon?: React.ElementType }[], type: 'choice' | 'multi-choice') => (
    <div className={commonStyles.flowStart}>
      {choices.map(choice => {
        const Icon = choice.icon || ArrowRight;
        const isSelected = type === 'multi-choice' && selectedSkills.includes(choice.value);
        return (
          <motion.button
            key={choice.value}
            className={cn(commonStyles.flowCard, themeStyles.flowCard, isSelected && commonStyles.flowCardSelected)}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              if (type === 'multi-choice') {
                handleFlowSkillToggle(choice.value);
              } else {
                handleAction(`flow_choice:${choice.value}`);
              }
            }}
            aria-label={choice.label}
          >
            <span className={cn(commonStyles.flowCardIcon, themeStyles.flowCardIcon)}>
              <Icon size={20} />
            </span>
            <span className={commonStyles.flowCardTitle}>{choice.label}</span>
            {isSelected && <CheckCircle2 size={16} className={commonStyles.flowCardCheck} />}
          </motion.button>
        );
      })}
      {type === 'multi-choice' && selectedSkills.length > 0 && (
        <motion.button
          className={cn(commonStyles.actionButton, commonStyles.actionButtonPrimary, themeStyles.actionButtonPrimary)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => handleAction('flow_skills_done')}
        >
          Done ({selectedSkills.length} selected) <ArrowRight size={14} />
        </motion.button>
      )}
    </div>
  );

  // ── Render: Role Selection Cards ───────────────────────────────────────

  const renderRoleSelection = () => (
    <div className={commonStyles.flowStart}>
      <motion.button
        className={cn(commonStyles.flowCard, themeStyles.flowCard)}
        whileHover={{ scale: 1.03, y: -4 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => handleAction('guest_role:client')}
      >
        <span className={cn(commonStyles.flowCardIcon, themeStyles.flowCardIcon)}>
          <Building2 size={28} />
        </span>
        <span className={commonStyles.flowCardTitle}>I'm a Client</span>
      </motion.button>
      <motion.button
        className={cn(commonStyles.flowCard, themeStyles.flowCard)}
        whileHover={{ scale: 1.03, y: -4 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => handleAction('guest_role:freelancer')}
      >
        <span className={cn(commonStyles.flowCardIcon, themeStyles.flowCardIcon)}>
          <User size={28} />
        </span>
        <span className={commonStyles.flowCardTitle}>I'm a Freelancer</span>
      </motion.button>
    </div>
  );

  // ── Render: Step Summary ──────────────────────────────────────────────

  const renderStepSummary = (msg: Message) => {
    const isCollapsed = collapsedSummaries[msg.id];
    return (
      <div className={cn(commonStyles.stepSummary, themeStyles.stepSummary)}>
        <button
          className={commonStyles.stepSummaryToggle}
          onClick={() => setCollapsedSummaries(prev => ({ ...prev, [msg.id]: !prev[msg.id] }))}
          aria-label={isCollapsed ? 'Expand summary' : 'Collapse summary'}
        >
          <span>Summary</span>
          {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={commonStyles.stepSummaryContent}
            >
              {msg.stepData?.map((item, idx) => (
                <div key={idx} className={commonStyles.stepSummaryRow}>
                  <span className={commonStyles.stepSummaryLabel}>{item.label}</span>
                  <span className={cn(commonStyles.stepSummaryValue, themeStyles.stepSummaryValue)}>{item.value}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // ── Render: Message ───────────────────────────────────────────────────

  const renderMessage = (message: Message) => {
    const isBot = message.sender === 'bot';

    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 12, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, type: 'spring', stiffness: 200, damping: 20 }}
        className={cn(
          commonStyles.message,
          isBot ? commonStyles.messageBot : commonStyles.messageUser,
          isBot ? themeStyles.messageBot : themeStyles.messageUser,
        )}
      >
        <div className={cn(commonStyles.messageBubble, themeStyles.messageBubble, commonStyles.markdownContent)}>
          {message.isMarkdown ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
          ) : (
            <p>{message.text}</p>
          )}
          {isBot && message.sentiment && (
            <span className={getSentimentClass(message.sentiment)}>
              {message.sentiment === 'positive' ? '\uD83D\uDE0A' : message.sentiment === 'negative' ? '\uD83D\uDE14' : '\uD83D\uDE10'}
            </span>
          )}
        </div>

        {message.isStepSummary && message.stepData && renderStepSummary(message)}

        {isBot && message.flowActions && message.flowActions.length > 0 && (
          <div className={commonStyles.suggestedActions}>
            {message.flowActions.map((fa, idx) => {
              const FaIcon = fa.icon;
              return (
                <motion.button
                  key={idx}
                  className={cn(
                    commonStyles.actionButton,
                    fa.variant === 'primary'
                      ? cn(commonStyles.actionButtonPrimary, themeStyles.actionButtonPrimary)
                      : cn(commonStyles.actionButtonSecondary, themeStyles.actionButtonSecondary),
                  )}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleAction(fa.action, fa.requiresAuth)}
                >
                  {FaIcon && <FaIcon size={14} />}
                  {fa.label}
                </motion.button>
              );
            })}
          </div>
        )}

        {isBot && message.suggestedActions && message.suggestedActions.length > 0 && (
          <div className={commonStyles.suggestedActions}>
            {message.suggestedActions.map((action, idx) => {
              const Icon = action.icon || Sparkles;
              const isPrimary = action.variant === 'primary';
              const isActionFlow = action.action?.startsWith('flow:');
              return (
                <motion.button
                  key={idx}
                  className={cn(
                    commonStyles.suggestedAction,
                    themeStyles.suggestedAction,
                    isPrimary && cn(commonStyles.actionButtonPrimary, themeStyles.actionButtonPrimary),
                    isActionFlow && commonStyles.actionButton,
                  )}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    if (action.action) {
                      handleAction(action.action, action.requiresAuth);
                    } else {
                      setInputValue(action.text);
                      inputRef.current?.focus();
                    }
                  }}
                >
                  <Icon size={14} />
                  {action.text}
                  {isActionFlow && <ArrowRight size={12} />}
                </motion.button>
              );
            })}
          </div>
        )}

        {isBot && !message.isStepSummary && (
          <div className={cn(commonStyles.feedbackRow, themeStyles.feedbackRow)}>
            <button
              className={cn(commonStyles.feedbackBtn, themeStyles.feedbackBtn)}
              onClick={() => handleFeedback(message.id, 'up')}
              aria-label="Helpful"
              data-active={message.feedbackGiven === 'up' ? 'true' : 'false'}
            >
              <ThumbsUp size={14} />
            </button>
            <button
              className={cn(commonStyles.feedbackBtn, themeStyles.feedbackBtn)}
              onClick={() => handleFeedback(message.id, 'down')}
              aria-label="Not helpful"
              data-active={message.feedbackGiven === 'down' ? 'true' : 'false'}
            >
              <ThumbsDown size={14} />
            </button>
          </div>
        )}

        <span className={cn(commonStyles.messageTime, themeStyles.messageTime)}>
          {formatTime(message.timestamp)}
        </span>
      </motion.div>
    );
  };

  // ── Sentiment class helper ────────────────────────────────────────────

  const getSentimentClass = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return themeStyles.sentimentBadge;
      case 'negative': return cn(commonStyles.sentimentBadge, themeStyles.sentimentBadgeNegative);
      default: return cn(commonStyles.sentimentBadge, themeStyles.sentimentBadgeNeutral);
    }
  };

  // ── Render: Skeleton loader ────────────────────────────────────────────

  const renderSkeleton = () => (
    <div className={cn(commonStyles.message, commonStyles.messageBot)}>
      <div className={commonStyles.loaderSkeleton}>
        <div className={commonStyles.loaderSkeletonLine} style={{ width: '80%' }} />
        <div className={commonStyles.loaderSkeletonLine} style={{ width: '60%' }} />
        <div className={commonStyles.loaderSkeletonLine} style={{ width: '40%' }} />
      </div>
    </div>
  );

  // ── Render: Flow step progress ─────────────────────────────────────────

  const renderStepProgress = () => {
    if (!activeFlowDef) return null;
    return (
      <div className={cn(commonStyles.stepProgress, themeStyles.stepProgress)}>
        <div
          className={cn(commonStyles.stepProgressBar, themeStyles.stepProgressBar)}
          style={{ width: `${flowProgress}%` }}
        />
        <span className={cn(commonStyles.stepLabel, themeStyles.stepLabel)}>
          {activeFlowDef.name} \u2014 Step {flowStepIndex + 1}/{activeFlowDef.steps.length}
        </span>
      </div>
    );
  };

  // ── Current flow step for inline choice rendering ──────────────────────

  const currentFlowStep = activeFlowDef?.steps[flowStepIndex];

  // ── Render: Main ──────────────────────────────────────────────────────

  return (
    <div className={commonStyles.chatbotContainer}>
      {/* Proactive Chip */}
      <AnimatePresence>
        {showProactiveChip && !isOpen && proactiveSuggestion && (
          <motion.div
            className={cn(commonStyles.proactiveChip, themeStyles.proactiveChip)}
            initial={{ opacity: 0, y: 20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 10, x: 20 }}
            transition={{ duration: 0.4, type: 'spring' }}
            onClick={toggleChatbot}
            role="button"
            tabIndex={0}
            aria-label={proactiveSuggestion}
          >
            <Bot size={16} />
            <span>{proactiveSuggestion}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={cn(
              commonStyles.chatbotAgent,
              themeStyles.chatbotAgent,
              isExpanded && commonStyles.expanded,
            )}
            role="dialog"
            aria-modal="true"
            aria-label="MegiBot AI Chat"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Header */}
            <div className={cn(commonStyles.chatbotAgentHeader, themeStyles.chatbotAgentHeader)}>
              <div className={commonStyles.headerLeft}>
                <div className={cn(commonStyles.aiAvatar, themeStyles.aiAvatar)}>
                  <RobotModel size={36} />
                  <div className={cn(commonStyles.aiAvatarPulse, themeStyles.aiAvatarPulse)} />
                </div>
                <div className={commonStyles.headerInfo}>
                  <h3>MegiBot AI</h3>
                  <span className={cn(commonStyles.headerStatus, themeStyles.headerStatus)}>
                    <span className={cn(
                      commonStyles.statusDot,
                      themeStyles.statusDot,
                      chatStatus === 'offline' && commonStyles.statusDotOffline,
                      chatStatus === 'degraded' && commonStyles.statusDotDegraded,
                    )} />
                    {isTyping
                      ? 'Typing\u2026'
                      : chatStatus === 'offline'
                      ? 'No connection'
                      : chatStatus === 'degraded'
                      ? 'Limited mode'
                      : 'Online'}
                    {chatStatus === 'degraded' && (
                      <button
                        className={commonStyles.retryBtn}
                        onClick={() => {
                          setChatStatus('online');
                          setMessages([]);
                          setConversationId(null);
                          setActiveFlow(null);
                          setFlowStepIndex(0);
                          setFlowData({});
                          setSelectedSkills([]);
                          startConversation();
                        }}
                        title="Retry connection"
                        aria-label="Retry connection"
                      >{'\u21BA'}</button>
                    )}
                  </span>
                </div>
                {isAuthenticated && user && (
                  <div className={cn(commonStyles.userAvatar, themeStyles.userAvatar)} title={user.name}>
                    {user.profile_image_url ? (
                      <img src={user.profile_image_url} alt={user.name} width={28} height={28} />
                    ) : (
                      <span>{userInitials}</span>
                    )}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  onClick={() => { setIsOpen(false); router.push('/ai/chatbot'); }}
                  className={cn(commonStyles.expandBtn, themeStyles.closeButton)}
                  aria-label="Open full page chatbot"
                  title="Open full chatbot page"
                >
                  <Maximize2 size={18} />
                </button>
                <button
                  onClick={toggleChatbot}
                  className={cn(commonStyles.closeButton, themeStyles.closeButton)}
                  aria-label="Close chat"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Guest Banner */}
            {!isAuthenticated && onboardingPhase === 'chatting' && (
              <motion.div
                className={cn(commonStyles.guestBanner, themeStyles.guestBanner)}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Lightbulb size={14} />
                <span>Sign in to unlock all features</span>
                <button
                  onClick={() => router.push('/login')}
                  aria-label="Sign in"
                >
                  Sign In <ArrowRight size={12} />
                </button>
              </motion.div>
            )}

            {/* Step Progress */}
            {renderStepProgress()}

            {/* Messages Area */}
            <div
              className={cn(commonStyles.chatbotAgentMessages, themeStyles.chatbotAgentMessages)}
              role="log"
              aria-live="polite"
              aria-label="Chat messages"
            >
              {messages.length === 0 && !isTyping && (
                <div className={commonStyles.suggestedActions}>
                  {ROLE_QUICK_ACTIONS[userRole].map((action, index) => (
                    <motion.button
                      key={index}
                      className={cn(
                        commonStyles.suggestedAction,
                        themeStyles.suggestedAction,
                        action.variant === 'primary' && cn(commonStyles.actionButtonPrimary, themeStyles.actionButtonPrimary),
                      )}
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        if (action.action) handleAction(action.action, action.requiresAuth);
                        else { setInputValue(action.text); inputRef.current?.focus(); }
                      }}
                    >
                      <action.icon size={14} />
                      {action.text}
                      {action.action?.startsWith('flow:') && <ArrowRight size={12} />}
                    </motion.button>
                  ))}
                </div>
              )}

              {messages.map(message => renderMessage(message))}

              {/* Last message flow choices rendered inline */}
              {messages.length > 0 && activeFlowDef && currentFlowStep && (currentFlowStep.type === 'choice' || currentFlowStep.type === 'multi-choice') && (() => {
                const lastMsg = messages[messages.length - 1];
                if (lastMsg.sender !== 'bot') return null;
                return renderFlowCards(currentFlowStep.choices || [], currentFlowStep.type);
              })()}

              {/* Typing Indicator */}
              {isTyping && (
                <div className={cn(commonStyles.message, commonStyles.messageBot)}>
                  <div className={cn(commonStyles.typingIndicator, themeStyles.typingIndicator)}>
                    <div className={cn(commonStyles.aiAvatar, themeStyles.aiAvatar)} style={{ width: 24, height: 24 }}>
                      <RobotModel size={24} />
                    </div>
                    <div className={commonStyles.typingDots}>
                      <span className={cn(commonStyles.typingDot, themeStyles.typingDot)} />
                      <span className={cn(commonStyles.typingDot, themeStyles.typingDot)} />
                      <span className={cn(commonStyles.typingDot, themeStyles.typingDot)} />
                    </div>
                  </div>
                </div>
              )}

              {/* Loading skeleton */}
              {isLoading && !isTyping && renderSkeleton()}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form
              className={cn(commonStyles.chatbotAgentInputForm, themeStyles.chatbotAgentInputForm)}
              onSubmit={handleSendMessage}
            >
              <div className={cn(commonStyles.inputWrapper, themeStyles.inputWrapper)}>
                <button
                  type="button"
                  className={cn(commonStyles.attachmentBtn, themeStyles.attachmentBtn)}
                  onClick={() => addBotMessage("File attachments coming soon! We\u2019re working on this feature.")}
                  aria-label="Attach file"
                  title="Attach file (coming soon)"
                >
                  <Paperclip size={16} />
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={activeFlow ? 'Type your answer\u2026' : 'Ask me anything\u2026'}
                  className={cn(commonStyles.chatbotAgentInput, themeStyles.chatbotAgentInput)}
                  disabled={isLoading || !conversationId}
                />
                <button
                  type="submit"
                  className={cn(commonStyles.sendButton, themeStyles.sendButton)}
                  disabled={isLoading || !inputValue.trim() || !conversationId}
                  aria-label="Send message"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        ref={buttonRef}
        onClick={toggleChatbot}
        onMouseMove={handleButtonMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleButtonMouseLeave}
        className={cn(commonStyles.toggleButton, themeStyles.toggleButton)}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.92 }}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <AnimatePresence>
          {isHovered && !isOpen && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className={cn(commonStyles.particle, themeStyles.particle)}
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: Math.cos((i * Math.PI * 2) / 6) * 40,
                    y: Math.sin((i * Math.PI * 2) / 6) * 40,
                  }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0, scale: 0 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0 }}
              transition={{ duration: 0.3, type: 'spring' }}
              className={commonStyles.flexCenter}
            >
              <div className={cn(commonStyles.closeIconWrapper, themeStyles.closeIconWrapper)}>
                <X size={32} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0, scale: 0 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0 }}
              transition={{ duration: 0.3, type: 'spring' }}
              className={commonStyles.flexCenter}
            >
              <RobotModel size={84} />
            </motion.div>
          )}
        </AnimatePresence>

        {!isOpen && unreadCount > 0 && (
          <motion.span
            className={cn(commonStyles.notificationBadge, themeStyles.notificationBadge)}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}

        <motion.div
          className={cn(commonStyles.glowRing, themeStyles.glowRing)}
          animate={{
            scale: isHovered ? [1, 1.15, 1] : 1,
            opacity: isHovered ? [0.5, 0.8, 0.5] : 0.3,
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.button>
    </div>
  );
}
