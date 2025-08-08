// @AI-HINT: This is the Messages page, designed with a three-column layout for a premium, real-time chat experience, similar to platforms like Slack or Discord.

import React from 'react';
import Image from 'next/image';
import { User, Search, Paperclip, Send } from 'lucide-react';
import styles from './Messages.module.css';

// AI-HINT: Mock data for the conversation list. In a real application, this would come from a real-time database or API.
const conversations = [
  {
    id: 1,
    name: 'Alice Johnson',
    lastMessage: 'Perfect, I will review the new designs by EOD.',
    timestamp: '10:42 AM',
    unread: 2,
    avatar: '/avatars/avatar-1.png', // Placeholder path
  },
  {
    id: 2,
    name: 'Project Phoenix Team',
    lastMessage: 'Just a reminder: stand-up is at 9:30 AM tomorrow.',
    timestamp: 'Yesterday',
    unread: 0,
    avatar: '/avatars/avatar-group.png',
  },
  {
    id: 3,
    name: 'Markus Lee',
    lastMessage: 'Can you send over the invoice? Thanks!',
    timestamp: '3 days ago',
    unread: 0,
    avatar: '/avatars/avatar-2.png',
  },
];

const MessagesPage = () => {
  return (
    <div className={styles.messagesContainer}>
      {/* Column 1: Conversation List */}
      <div className={styles.conversationList}>
        <div className={styles.listHeader}>
          <h2>Messages</h2>
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input type="text" placeholder="Search messages..." />
          </div>
        </div>
        <div className={styles.conversations}>
          {conversations.map((convo) => (
            <div key={convo.id} className={`${styles.convoItem} ${convo.id === 1 ? styles.active : ''}`}>
              <Image src={convo.avatar} alt={convo.name} className={styles.avatar} width={40} height={40} />
              <div className={styles.convoDetails}>
                <div className={styles.convoHeader}>
                  <span className={styles.convoName}>{convo.name}</span>
                  <span className={styles.convoTimestamp}>{convo.timestamp}</span>
                </div>
                <p className={styles.lastMessage}>{convo.lastMessage}</p>
              </div>
              {convo.unread > 0 && <div className={styles.unreadBadge}>{convo.unread}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Column 2: Chat Window */}
      <div className={styles.chatWindow}>
        <div className={styles.chatHeader}>
          <h3>Alice Johnson</h3>
          <p>Lead UI/UX Designer</p>
        </div>
        <div className={styles.messageArea}>
          {/* AI-HINT: Messages would be rendered here from a state object. */}
          <div className={`${styles.message} ${styles.received}`}><p>Hey, I&apos;ve pushed the latest wireframes to the Figma project. Let me know your thoughts!</p></div>
          <div className={`${styles.message} ${styles.sent}`}><p>Awesome, thanks! Taking a look now.</p></div>
          <div className={`${styles.message} ${styles.received}`}><p>Perfect, I will review the new designs by EOD.</p></div>
        </div>
        <div className={styles.chatInputArea}>
          <button className={styles.iconButton} title="Attach file">
            <Paperclip size={20} />
          </button>
          <input type="text" placeholder="Type a message..." className={styles.chatInput} />
          <button className={`${styles.iconButton} ${styles.sendButton}`} title="Send message">
            <Send size={20} />
          </button>
        </div>
      </div>

      {/* Column 3: Details Panel */}
      <div className={styles.detailsPanel}>
        <div className={styles.panelHeader}>
          <Image src="/avatars/avatar-1.png" alt="Alice Johnson" className={styles.panelAvatar} width={80} height={80} />
          <h3>Alice Johnson</h3>
          <p>Online</p>
        </div>
        <div className={styles.panelSection}>
          <h4><User size={16} /> About</h4>
          <p>Lead UI/UX Designer at Innovate Inc. Passionate about creating intuitive and beautiful user experiences.</p>
        </div>
        <div className={styles.panelSection}>
          <h4><Paperclip size={16} /> Shared Files</h4>
          {/* AI-HINT: A list of shared files would be rendered here. */}
          <p>No files shared yet.</p>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
