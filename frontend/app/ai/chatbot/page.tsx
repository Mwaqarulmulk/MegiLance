// @AI-HINT: This is the Next.js route file for the AI Chatbot page. Uses the enhanced V2 chatbot with
// real-time status monitoring, offline mode support, and modern UI.
import { Metadata } from 'next';
import ChatbotEnhanced from './ChatbotEnhanced';

import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'AI Assistant Chatbot | MegiLance Escrow & Matching Copilot',
  description: 'Chat with our AI Copilot to scope projects, estimate prices, match with vetted freelancers, and understand escrow protocols in real-time.',
};

const ChatbotFallback = () => (
  <div className="max-w-4xl mx-auto my-10 p-8 border rounded-2xl bg-white dark:bg-slate-950 shadow-sm text-center">
    <h1 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">MegiLance AI Assistant Copilot</h1>
    <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto leading-relaxed">
      Welcome to the MegiLance AI Copilot. Chat with our assistant to scope your freelance projects, 
      estimate project prices, draft professional proposals, and understand smart-contract escrow protocols in real-time. 
      Loading the interactive conversation suite...
    </p>
    <div className="animate-pulse space-y-4 max-w-xl mx-auto">
      <div className="h-48 bg-slate-100 dark:bg-slate-850 rounded-2xl"></div>
      <div className="h-12 bg-slate-100 dark:bg-slate-850 rounded-xl"></div>
    </div>
  </div>
);

export default function ChatbotPage() {
  return (
    <Suspense fallback={<ChatbotFallback />}>
      <ChatbotEnhanced />
    </Suspense>
  );
}
