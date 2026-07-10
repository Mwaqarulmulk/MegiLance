import { useEffect, useState, useRef } from 'react';
import commonStyles from './LiveEditor.common.module.css';
import lightStyles from './LiveEditor.light.module.css';
import darkStyles from './LiveEditor.dark.module.css';
import { useTheme } from 'next-themes';
import Editor from '@monaco-editor/react';
import { cn } from '@/lib/utils';
import { useWebSocket } from '@/hooks/useWebSocket';

interface LiveEditorProps {
  contractId: string;
}

export default function LiveEditor({ contractId }: LiveEditorProps) {
  const { resolvedTheme } = useTheme();
  const { connected, on, off, send } = useWebSocket();
  const [code, setCode] = useState<string>('// Start coding here...');
  const [localCode, setLocalCode] = useState<string>('// Start coding here...');
  const [mounted, setMounted] = useState(false);

  const codeRef = useRef(code);
  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted || !resolvedTheme) return null;

  const themeStyles = resolvedTheme === 'light' ? lightStyles : darkStyles;
  const editorTheme = resolvedTheme === 'dark' ? 'vs-dark' : 'vs-light';

  return (
    <div className={cn(commonStyles.container, themeStyles.container)}>
      <div className={commonStyles.header}>
        <h3>Live Source Editor</h3>
        <span className={cn(themeStyles.badge, connected ? themeStyles.connected : '')}>
          {connected ? 'Connected' : 'Offline'}
        </span>
      </div>
      <div className={commonStyles.editorWrapper}>
        <Editor
          height="100%"
          defaultLanguage="typescript"
          theme={editorTheme}
          value={localCode}
          onChange={(value) => setLocalCode(value || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            padding: { top: 16 }
          }}
        />
      </div>
    </div>
  );
}
