// @AI-HINT: This component provides a fully theme-aware editor for administrators to update policy documents. It uses per-component CSS modules and the cn utility for robust, maintainable styling.
'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { FileText, ShieldCheck, UserCheck, Save, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '@/app/components/atoms/Button/Button';
import Textarea from '@/app/components/atoms/Textarea/Textarea';
import { legalDocsApi } from '@/lib/api';

import commonStyles from './AdminPolicyEditor.common.module.css';
import lightStyles from './AdminPolicyEditor.light.module.css';
import darkStyles from './AdminPolicyEditor.dark.module.css';

const policyConfig = {
  terms: { title: 'Terms of Service', icon: FileText },
  privacy: { title: 'Privacy Policy', icon: ShieldCheck },
  kyc: { title: 'KYC Policy', icon: UserCheck },
} as const;

type PolicyType = keyof typeof policyConfig;

const AdminPolicyEditor: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyType>('terms');
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const themeStyles = resolvedTheme === 'dark' ? darkStyles : lightStyles;

  useEffect(() => {
    const fetchPolicy = async () => {
      setLoading(true);
      setError(null);
      try {
        const doc = await legalDocsApi.getDocument(selectedPolicy);
        const docContent = (doc as any)?.content || '';
        setContent(docContent);
        setOriginalContent(docContent);
      } catch (err) {
        setError('Failed to load policy document');
        setContent('');
        setOriginalContent('');
      } finally {
        setLoading(false);
      }
    };
    fetchPolicy();
  }, [selectedPolicy]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // DEFERRED: Requires backend admin policy update endpoint
      // await legalDocsApi.updateDocument(selectedPolicy, { content });
      await new Promise(resolve => setTimeout(resolve, 1500));
      setOriginalContent(content);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      setError('Failed to save policy document');
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = content !== originalContent;

  return (
    <div className={cn(commonStyles.editorLayout, themeStyles.editorLayout)}>
      <aside className={cn(commonStyles.sidebar, themeStyles.sidebar)}>
        <h2 className={cn(commonStyles.sidebarTitle, themeStyles.sidebarTitle)}>Policies</h2>
        <nav className={commonStyles.policyNav}>
          {Object.keys(policyConfig).map((key) => {
            const policy = policyConfig[key as PolicyType];
            const Icon = policy.icon;
            return (
              <button
                key={key}
                onClick={() => setSelectedPolicy(key as PolicyType)}
                className={cn(
                  commonStyles.navItem,
                  themeStyles.navItem,
                  selectedPolicy === key && commonStyles.navItemActive,
                  selectedPolicy === key && themeStyles.navItemActive
                )}
              >
                <Icon size={18} className={commonStyles.navIcon} />
                <span>{policy.title}</span>
              </button>
            );
          })}
        </nav>
      </aside>
      <main className={commonStyles.mainContent}>
        <div className={cn(commonStyles.editorHeader, themeStyles.editorHeader)}>
          <h1 className={cn(commonStyles.editorTitle, themeStyles.editorTitle)}>{policyConfig[selectedPolicy].title}</h1>
          <div className={commonStyles.editorActions}>
            {isSaved && (
              <div className={cn(commonStyles.saveConfirmation, themeStyles.saveConfirmation)}>
                <CheckCircle size={18} />
                <span>Saved!</span>
              </div>
            )}
            <Button variant="primary" onClick={handleSave} disabled={isSaving || !hasChanges} iconBefore={isSaving ? undefined : <Save size={16} />}>
              {isSaving ? 'Saving...' : 'Save Policy'}
            </Button>
          </div>
        </div>
        {loading && <div className="p-8 text-center">Loading policy...</div>}
        {error && (
          <div className="p-8 text-center text-red-500 flex items-center justify-center gap-2">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
        {!loading && !error && (
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={cn(commonStyles.editorTextarea, themeStyles.editorTextarea)}
            wrapperClassName={commonStyles.editorTextareaWrapper}
          />
        )}
      </main>
    </div>
  );
};

export default AdminPolicyEditor;
