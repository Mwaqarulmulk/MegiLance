// @AI-HINT: This component renders the input form for sending a new message. It manages its own state for the message text and provides a callback when the message is sent.

'use client';

import React, { useRef, useState } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { useToaster } from '@/app/components/Toast/ToasterProvider';
import commonStyles from './MessageInput.common.module.css';
import lightStyles from './MessageInput.light.module.css';
import darkStyles from './MessageInput.dark.module.css';

interface MessageInputProps {
  conversationId: number | null;
  onMessageSent: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ conversationId, onMessageSent }) => {
  const { notify } = useToaster();
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSending) return;
    if (!conversationId) {
      notify({ title: 'No conversation selected', description: 'Choose a conversation to send a message.', variant: 'warning', duration: 2500 });
      return;
    }
    if (!text.trim()) {
      notify({ title: 'Message is empty', description: 'Type something before sending.', variant: 'info', duration: 2000 });
      return;
    }

    setIsSending(true);
    try {
      // Frontend-only demo: call backend endpoint if available; otherwise simulate success
      const response = await fetch(`/api/messages/${conversationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageText: text.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setText('');
      onMessageSent(); // Notify parent to trigger refresh
      notify({ title: 'Message sent', description: 'Your message was delivered.', variant: 'success', duration: 1800 });
    } catch (error) {
      console.error('Error sending message:', error);
      notify({ title: 'Failed to send', description: 'Please retry in a moment.', variant: 'danger', duration: 2600 });
    } finally {
      setIsSending(false);
    }
  };

  const onAttachClick = () => {
    fileInputRef.current?.click();
  };

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Demo feedback: size check and toast
    const tooLarge = file.size > 10 * 1024 * 1024; // 10MB
    if (tooLarge) {
      notify({ title: 'File too large', description: 'Please attach a file under 10MB.', variant: 'warning', duration: 3000 });
    } else {
      notify({ title: 'Attachment added', description: file.name, variant: 'info', duration: 2200 });
    }
    // reset input so same file can be selected again later
    e.currentTarget.value = '';
  };

  return (
    <form className="MessageInput-form" onSubmit={handleSubmit} aria-label="Send message form">
      <div role="status" aria-live="polite" className="MessageInput-status">
        {isSending ? 'Sending…' : ''}
      </div>
      <button
        type="button"
        className="MessageInput-button MessageInput-attach"
        aria-label="Attach a file"
        onClick={onAttachClick}
        disabled={!conversationId || isSending}
      >
        <Paperclip size={18} />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        className="MessageInput-fileInput"
        onChange={onFileChange}
        aria-hidden="true"
        tabIndex={-1}
        hidden
      />
      <input
        type="text"
        className="MessageInput-input"
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        autoComplete="off"
        aria-invalid={text.trim().length === 0}
        disabled={!conversationId || isSending}
      />
      <button type="submit" className="MessageInput-button" aria-label="Send message" disabled={!conversationId || isSending}>
        <Send size={20} />
      </button>
    </form>
  );
};

export default MessageInput;
