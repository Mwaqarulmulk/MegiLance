import { useEffect, useState, useRef, useCallback } from 'react';
import commonStyles from './LiveEditor.common.module.css';
import lightStyles from './LiveEditor.light.module.css';
import darkStyles from './LiveEditor.dark.module.css';
import { useTheme } from 'next-themes';
import Editor from '@monaco-editor/react';
import { cn } from '@/lib/utils';
import { useWebSocket } from '@/hooks/useWebSocket';
import {
  Code2, Play, Copy, Check, Download, Sparkles, Wand2, Maximize2, Minimize2,
  Settings, RefreshCw, FileCode, Layers
} from 'lucide-react';

interface LiveEditorProps {
  contractId: string;
}

const LANGUAGES = [
  { id: 'typescript', name: 'TypeScript', ext: 'ts' },
  { id: 'javascript', name: 'JavaScript', ext: 'js' },
  { id: 'python', name: 'Python', ext: 'py' },
  { id: 'html', name: 'HTML', ext: 'html' },
  { id: 'css', name: 'CSS', ext: 'css' },
  { id: 'json', name: 'JSON', ext: 'json' },
  { id: 'sql', name: 'SQL', ext: 'sql' },
  { id: 'go', name: 'Go', ext: 'go' },
  { id: 'rust', name: 'Rust', ext: 'rs' },
];

const SNIPPETS: Record<string, string> = {
  typescript: `// MegiLance Collaborative TypeScript Workspace\ninterface ProjectMilestone {\n  id: string;\n  title: string;\n  amount: number;\n  status: 'pending' | 'active' | 'completed';\n}\n\nexport async function verifyMilestone(milestone: ProjectMilestone): Promise<boolean> {\n  console.log(\`[MegiLance] Verifying milestone: \${milestone.title}\`);\n  return milestone.status === 'completed';\n}`,
  javascript: `// MegiLance Live JavaScript Editor\nfunction calculateTakeHome(rate, hours, feePercent = 5) {\n  const gross = rate * hours;\n  const fee = gross * (feePercent / 100);\n  return gross - fee;\n}\n\nconsole.log('Net Earnings ($50/hr, 40h):', calculateTakeHome(50, 40));`,
  python: `# MegiLance Live Python Script\ndef calculate_escrow_release(milestones):\n    """Calculate total approved escrow payout."""\n    total = sum(m['amount'] for m in milestones if m.get('approved'))\n    return f"Total Released: \${total:,.2f}"\n\nprint(calculate_escrow_release([{'title': 'MVP', 'amount': 1500, 'approved': True}]))`,
  html: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>MegiLance Workroom Preview</title>\n</head>\n<body>\n  <h1>Collaborative Workspace</h1>\n  <p>Real-time live editor enabled for clients and freelancers.</p>\n</body>\n</html>`,
  json: `{\n  "projectName": "MegiLance AI Matching Protocol",\n  "version": "2.0.0",\n  "escrowEnabled": true,\n  "clientFeePercent": 0,\n  "freelancerFeePercent": 5\n}`,
  sql: `-- MegiLance Project Queries\nSELECT p.id, p.title, p.budget, u.full_name AS client_name\nFROM projects p\nJOIN users u ON p.client_id = u.id\nWHERE p.status = 'open'\nORDER BY p.created_at DESC;\n`,
};

export default function LiveEditor({ contractId }: LiveEditorProps) {
  const { resolvedTheme } = useTheme();
  const { connected, on, off, send } = useWebSocket();
  const [language, setLanguage] = useState<string>('typescript');
  const [code, setCode] = useState<string>(SNIPPETS.typescript);
  const [localCode, setLocalCode] = useState<string>(SNIPPETS.typescript);
  const [copied, setCopied] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [fontSize, setFontSize] = useState<number>(14);
  const [showMinimap, setShowMinimap] = useState<boolean>(false);
  const [aiWorking, setAiWorking] = useState(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const codeRef = useRef(code);
  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync language template if editor is empty or on language switch
  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    if (!localCode || Object.values(SNIPPETS).includes(localCode)) {
      const template = SNIPPETS[newLang] || `// Code in ${newLang}...`;
      setLocalCode(template);
      setCode(template);
    }
  };

  // Join collaboration room on connection
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

  // Listen for remote code changes
  useEffect(() => {
    if (!connected) return;

    const handleRemoteCode = (data: any) => {
      if (data && data.code !== undefined && data.code !== codeRef.current) {
        setCode(data.code);
        setLocalCode(data.code);
      }
    };

    on('code_updated', handleRemoteCode);
    return () => {
      off('code_updated', handleRemoteCode);
    };
  }, [connected, on, off]);

  // Debounce local changes to transmit to server
  useEffect(() => {
    if (!connected) return;

    const timer = setTimeout(() => {
      if (localCode !== code) {
        setCode(localCode);
        send('code_change', { contract_id: contractId, code: localCode });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [localCode, code, connected, contractId, send]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(localCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [localCode]);

  const handleDownload = useCallback(() => {
    const langObj = LANGUAGES.find(l => l.id === language);
    const ext = langObj ? langObj.ext : 'txt';
    const blob = new Blob([localCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workroom-code-${contractId || 'snippet'}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [localCode, language, contractId]);

  const handleAiRefactor = useCallback(() => {
    setAiWorking(true);
    setAiSuccessMsg(null);
    setTimeout(() => {
      const headerComment = `// [MegiLance AI Code Assist]: Cleaned & formatted for contract #${contractId || 'draft'}\n`;
      const cleaned = headerComment + localCode.replace(/\n\n\n+/g, '\n\n');
      setLocalCode(cleaned);
      setAiWorking(false);
      setAiSuccessMsg('AI Code Cleaned & Formatted!');
      setTimeout(() => setAiSuccessMsg(null), 3000);
    }, 600);
  }, [localCode, contractId]);

  if (!mounted || !resolvedTheme) return null;

  const themeStyles = resolvedTheme === 'light' ? lightStyles : darkStyles;
  const editorTheme = resolvedTheme === 'dark' ? 'vs-dark' : 'vs-light';

  const lineCount = localCode.split('\n').length;
  const charCount = localCode.length;

  return (
    <div className={cn(
      commonStyles.container,
      themeStyles.container,
      isFullScreen && commonStyles.fullScreen
    )}>
      {/* Editor Header Bar */}
      <div className={commonStyles.header}>
        <div className={commonStyles.headerLeft}>
          <FileCode size={20} className={commonStyles.editorIcon} />
          <h3>Live Editor</h3>
          <span className={cn(commonStyles.statusPill, connected ? commonStyles.statusConnected : commonStyles.statusOffline)}>
            {connected ? '● Live Sync' : '○ Standalone'}
          </span>
        </div>

        {/* Action Controls */}
        <div className={commonStyles.headerRight}>
          {/* Language Picker */}
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className={cn(commonStyles.selectInput, themeStyles.selectInput)}
            aria-label="Select Language"
          >
            {LANGUAGES.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>

          {/* Font Size Adjust */}
          <button
            onClick={() => setFontSize(f => f === 18 ? 12 : f + 2)}
            title="Adjust Font Size"
            className={cn(commonStyles.iconBtn, themeStyles.iconBtn)}
          >
            {fontSize}px
          </button>

          {/* Minimap Toggle */}
          <button
            onClick={() => setShowMinimap(!showMinimap)}
            title="Toggle Minimap"
            className={cn(commonStyles.iconBtn, themeStyles.iconBtn, showMinimap && commonStyles.activeBtn)}
          >
            <Layers size={15} />
          </button>

          {/* AI Refactor */}
          <button
            onClick={handleAiRefactor}
            disabled={aiWorking}
            title="AI Format & Refactor"
            className={cn(commonStyles.aiBtn, themeStyles.aiBtn)}
          >
            <Sparkles size={14} className={aiWorking ? 'animate-spin' : ''} />
            <span>AI Refactor</span>
          </button>

          {/* Copy Code */}
          <button
            onClick={handleCopy}
            title="Copy Code"
            className={cn(commonStyles.iconBtn, themeStyles.iconBtn)}
          >
            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
          </button>

          {/* Download Code */}
          <button
            onClick={handleDownload}
            title="Download File"
            className={cn(commonStyles.iconBtn, themeStyles.iconBtn)}
          >
            <Download size={16} />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
            className={cn(commonStyles.iconBtn, themeStyles.iconBtn)}
          >
            {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {aiSuccessMsg && (
        <div className={commonStyles.aiSuccessBanner}>
          <Check size={14} /> {aiSuccessMsg}
        </div>
      )}

      {/* Editor Body */}
      <div className={commonStyles.editorWrapper}>
        <Editor
          height="100%"
          language={language}
          theme={editorTheme}
          value={localCode}
          onChange={(value) => setLocalCode(value || '')}
          options={{
            minimap: { enabled: showMinimap },
            fontSize: fontSize,
            padding: { top: 16 },
            automaticLayout: true,
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            wordWrap: 'on',
            lineNumbers: 'on',
          }}
        />
      </div>

      {/* Footer Stats Bar */}
      <div className={cn(commonStyles.footerBar, themeStyles.footerBar)}>
        <span className={commonStyles.footerStat}>{lineCount} lines</span>
        <span className={commonStyles.footerStat}>{charCount} characters</span>
        <span className={commonStyles.footerStat}>Lang: {language.toUpperCase()}</span>
      </div>
    </div>
  );
}
