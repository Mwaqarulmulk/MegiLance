import os

realtime_css = '''/* @AI-HINT: Premium RealtimeChat Styles */
.container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  position: relative;
  background: inherit;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 2rem;
  border-bottom: 1px solid rgba(128, 128, 128, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 10;
}

.headerUser {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.headerUserInfo {
  display: flex;
  flex-direction: column;
}

.headerName {
  font-weight: 700;
  font-size: 1.15rem;
  letter-spacing: -0.01em;
}

.headerStatus {
  font-size: 0.85rem;
  opacity: 0.7;
  font-weight: 500;
}

.headerActions {
  display: flex;
  gap: 0.5rem;
}

.iconBtn {
  background: transparent;
  border: none;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1);
  opacity: 0.6;
}
.iconBtn:hover {
  opacity: 1;
  background: rgba(128, 128, 128, 0.1);
  transform: scale(1.05);
}

.messagesArea {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  scroll-behavior: smooth;
}

.centerState {
  margin: auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.spinIcon {
  animation: spin 1s linear infinite;
}
@keyframes spin { 100% { transform: rotate(360deg); } }

.dateSep {
  text-align: center;
  margin: 1.5rem 0;
}
.dateSep span {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.3rem 0.8rem;
  border-radius: 1rem;
  background: rgba(128, 128, 128, 0.1);
  color: var(--text-secondary);
}

.msgRow {
  display: flex;
  position: relative;
  align-items: flex-end;
  gap: 0.75rem;
  width: 100%;
}

.msgRowOwn {
  justify-content: flex-end;
}

.msgRowOther {
  justify-content: flex-start;
}

.bubble {
  max-width: 65%;
  padding: 0.875rem 1.125rem;
  border-radius: 1.25rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  font-size: 0.95rem;
  line-height: 1.5;
  will-change: transform;
}

.bubbleOwn {
  background: linear-gradient(135deg, #4573df, #2b5bc7);
  color: white;
  border-bottom-right-radius: 0.25rem;
}

.bubbleOther {
  background: var(--bg-secondary, rgba(128, 128, 128, 0.05));
  border: 1px solid rgba(128, 128, 128, 0.1);
  border-bottom-left-radius: 0.25rem;
}

.bubbleText {
  word-wrap: break-word;
}

.attachment {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 0.5rem;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;
  color: inherit;
  transition: background 0.2s;
}
.attachment:hover {
  background: rgba(255, 255, 255, 0.25);
}

.bubbleMeta {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.35rem;
  justify-content: flex-end;
}

.bubbleMetaOwn {  }

.bubbleTime {
  font-size: 0.7rem;
  opacity: 0.7;
}

.typingBubble {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 1rem 1.25rem;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.4;
  animation: typingBounce 1.4s infinite ease-in-out;
}
.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }
@keyframes typingBounce {
  0%, 80%, 100% { transform: scale(0); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

.inputArea {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1.25rem 2rem;
  border-top: 1px solid rgba(128, 128, 128, 0.1);
  backdrop-filter: blur(10px);
}

.inputIconBtn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.inputIconBtn:hover {
  background: rgba(128, 128, 128, 0.1);
  color: var(--text-primary);
}

.textareaWrap {
  flex: 1;
  display: flex;
  background: rgba(128, 128, 128, 0.05);
  border: 1px solid rgba(128, 128, 128, 0.1);
  border-radius: 1.5rem;
  padding: 0.1rem 1rem;
  min-height: 44px;
}

.textarea {
  width: 100%;
  border: none;
  background: transparent;
  resize: none;
  padding: 0.75rem 0;
  font-family: inherit;
  font-size: 0.95rem;
  max-height: 120px;
  color: var(--text-primary);
  outline: none;
}

.sendBtn {
  background: var(--bg-secondary);
  border: none;
  color: var(--text-muted);
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: cursor;
  transition: all 0.25s cubic-bezier(0.25, 1, 0.5, 1);
  transform: scale(0.9);
}

.sendBtnActive {
  background: var(--primary-color, #4573df);
  color: white;
  transform: scale(1);
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(69, 115, 239, 0.3);
}
.sendBtnActive:hover {
  transform: scale(1.05);
}
'''

chatinbox_css = '''/* @AI-HINT: Premium Styles for ChatInbox */
.container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: transparent;
}

.header {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  border-bottom: 1px solid rgba(128, 128, 128, 0.1);
}

.headerTop {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.headerLeft {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.title {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.unreadBadge {
  background: #e81123;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.1rem 0.6rem;
  border-radius: 1rem;
}

.composeBtn {
  background: rgba(128, 128, 128, 0.1);
  border: none;
  border-radius: 50%;
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1);
}
.composeBtn:hover {
  background: var(--primary-color, #4573df);
  color: white;
  transform: scale(1.05);
}

.searchWrap {
  position: relative;
  display: flex;
  align-items: center;
}

.searchIcon {
  position: absolute;
  left: 1rem;
  opacity: 0.5;
}

.searchInput {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border-radius: 1rem;
  border: 1px solid rgba(128, 128, 128, 0.1);
  background: rgba(128, 128, 128, 0.05);
  font-size: 0.95rem;
  outline: none;
  transition: all 0.2s;
}
.searchInput:focus {
  border-color: var(--primary-color, #4573df);
  background: transparent;
  box-shadow: 0 0 0 4px rgba(69, 115, 239, 0.1);
}

.list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1);
  border: 1px solid transparent;
}

.item:hover {
  background: rgba(128, 128, 128, 0.05);
  transform: translateX(4px);
}

.item.active {
  background: rgba(69, 115, 239, 0.08);
  border-color: rgba(69, 115, 239, 0.2);
}

.avatarWrap {
  position: relative;
  flex-shrink: 0;
}

.onlineDot {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid var(--bg-primary);
}

.onlineDotGreen { background: #22c55e; }
.onlineDotGray { background: #9ca3af; }

.details {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.userName {
  font-weight: 600;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.timestamp {
  font-size: 0.75rem;
  opacity: 0.6;
}

.lastMessage {
  font-size: 0.85rem;
  opacity: 0.7;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.typingText {
  font-size: 0.85rem;
  color: var(--primary-color, #4573df);
  font-style: italic;
  font-weight: 500;
}
'''

with open('E:/MegiLance/frontend/app/components/organisms/Messaging/RealtimeChat.common.module.css', 'w', encoding='utf-8') as f:
    f.write(realtime_css)

with open('E:/MegiLance/frontend/app/components/organisms/Messaging/ChatInbox/ChatInbox.common.module.css', 'w', encoding='utf-8') as f:
    f.write(chatinbox_css)

print("CSS logic rewritten with premium aesthetics and correct class bindings.")