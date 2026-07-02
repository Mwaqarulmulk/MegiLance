// @AI-HINT: This is the Next.js route file for the AI Chatbot page. Uses the enhanced V2 chatbot with
// real-time status monitoring, offline mode support, and modern UI.
import { Metadata } from 'next';
import ChatbotEnhanced from './ChatbotEnhanced';

export const metadata: Metadata = {
  title: 'AI Assistant Chatbot | MegiLance Escrow & Matching Copilot',
  description: 'Chat with our AI Copilot to scope projects, estimate prices, match with vetted freelancers, and understand escrow protocols in real-time.',
};

export default function ChatbotPage() {
  return <ChatbotEnhanced />;
}
