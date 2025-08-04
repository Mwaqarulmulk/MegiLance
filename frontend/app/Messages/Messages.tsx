// @AI-HINT: This is the Messages page root component. All styles are per-component only. See Messages.common.css, Messages.light.css, and Messages.dark.css for theming.
'use client';
import React from 'react';
import './Messages.common.css';
import './Messages.light.css';
import './Messages.dark.css';

interface MessagesProps {
  theme?: 'light' | 'dark';
}

const Messages: React.FC<MessagesProps> = ({ theme = 'light' }) => {
  const mockConversations = [
    { id: 1, name: 'John Doe', lastMessage: 'Sounds good, let&apos;s proceed.', timestamp: '10:45 AM' },
    { id: 2, name: 'Jane Smith', lastMessage: 'Can you send over the new designs?', timestamp: 'Yesterday' },
    { id: 3, name: 'Global Retail Inc.', lastMessage: 'The contract is ready for review.', timestamp: '2 days ago' },
  ];

  const [selectedConversation, setSelectedConversation] = React.useState(mockConversations[0]);

  return (
    <div className={`Messages Messages--${theme}`}>
      <aside className="Messages-sidebar">
        <div className="Messages-sidebar-header">
          <h2>Conversations</h2>
        </div>
        <div className="Messages-conversation-list">
          {mockConversations.map(convo => (
            <div 
              key={convo.id} 
              className={`Messages-conversation-item ${selectedConversation?.id === convo.id ? 'active' : ''}`}
              onClick={() => setSelectedConversation(convo)}
            >
              <div className="Messages-conversation-name">{convo.name}</div>
              <div className="Messages-conversation-preview">{convo.lastMessage}</div>
              <div className="Messages-conversation-timestamp">{convo.timestamp}</div>
            </div>
          ))}
        </div>
      </aside>
      <main className="Messages-main">
        {selectedConversation ? (
          <>
            <div className="Messages-chat-header">
              <h3>{selectedConversation.name}</h3>
            </div>
            <div className="Messages-chat-window">
              {/* Mock chat messages */}
              <div className="Message Message--incoming">
                <p>Hey, just checking in on the project status. How are things looking?</p>
                <span className="Message-timestamp">10:46 AM</span>
              </div>
              <div className="Message Message--outgoing">
                <p>Things are going well! I&apos;ve just pushed the latest updates to the staging server for you to review.</p>
                <span className="Message-timestamp">10:47 AM</span>
              </div>
              <div className="Message Message--incoming">
                <p>Great, I&apos;ll take a look now. Sounds good, let&apos;s proceed.</p>
                <span className="Message-timestamp">10:48 AM</span>
              </div>
            </div>
            <div className="Messages-chat-input">
              <input type="text" placeholder="Type a message..." />
              <button>Send</button>
            </div>
          </>
        ) : (
          <div className="Messages-no-chat-selected">
            <p>Select a conversation to start messaging.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Messages;
