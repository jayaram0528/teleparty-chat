import React, { useState, useEffect, useRef } from 'react';
import { TelepartyClient, SocketMessageTypes } from 'teleparty-websocket-lib';
import { AppState, ChatMessage } from '../types/chat.types';

interface ChatRoomProps {
  client: TelepartyClient | null;
  appState: AppState;
  messages: ChatMessage[];
  typingUsers: string[];
  onSendMessage: (message: string) => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({
  client,
  appState,
  messages,
  typingUsers,
  onSendMessage
}) => {
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Maps permId → nickname (for typing indicator)
  const userNicknameMap = useRef<Map<string, string>>(new Map());

  /**
   * Cache user nicknames from messages
   */
  useEffect(() => {
    messages.forEach(msg => {
      if (msg.permId && msg.userNickname) {
        userNicknameMap.current.set(msg.permId, msg.userNickname);
      }
    });
  }, [messages]);

  /**
   * Auto-scroll to bottom on new message
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * FORMAT SYSTEM MESSAGES WITH USERNAME
   */
  const formatSystemMessage = (msg: ChatMessage) => {
    const username = msg.userNickname || 'Someone';

    if (msg.body === 'left') {
      return `${username} left the party`;
    }

    if (msg.body.includes('created the party') || msg.body.includes('joined the party')) {
      return `${username} ${msg.body}`;
    }

    return `${username} ${msg.body}`;
  };

  /**
   * SEND MESSAGE
   */
  const handleSendMessage = () => {
    if (!client || !messageInput.trim()) return;

    console.log('📤 Sending message to server:', messageInput.trim());

    // Send via App.tsx handler
    onSendMessage(messageInput.trim());

    setMessageInput('');
    stopTyping();
  };

  /**
   * Typing presence handling (debounced)
   * FIX: reset timer on every key press; send typing:true only once per typing session
   */
  const startTyping = () => {
    if (!client) return;

    // Always reset debounce timer on each key press
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Only send typing:true once when we transition false -> true
    if (!isTyping) {
      client.sendMessage(SocketMessageTypes.SET_TYPING_PRESENCE, { typing: true });
      setIsTyping(true);
    }

    // Stop typing after 3s of no input
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  };

  const stopTyping = () => {
    if (!client) return;

    // Clear timer
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    // Only send typing:false if we are currently in typing state
    if (isTyping) {
      client.sendMessage(SocketMessageTypes.SET_TYPING_PRESENCE, { typing: false });
      setIsTyping(false);
    }
  };

  /**
   * Cleanup typing timeout on unmount
   */
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: number) =>
    new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

  /**
   * UPDATED: Typing text (generic, reliable)
   * Teleparty notes that showing names isn't required; indicating typing is sufficient. [file:1]
   */
  const getTypingText = () => {
    if (!typingUsers || typingUsers.length === 0) return '';
    return 'Someone is typing...';
  };

  const copyRoomId = () => {
    if (!appState.roomId) return;
    navigator.clipboard.writeText(appState.roomId);
    alert('Room ID copied!');
  };

  const handleLeaveMeeting = () => {
    if (window.confirm('Are you sure you want to leave this chat room?')) {
      window.location.reload();
    }
  };

  const handleEndMeeting = () => {
    if (window.confirm('Are you sure you want to END this meeting for everyone?')) {
      alert('Meeting ended. All participants will be notified.');
      window.location.reload();
    }
  };

  return (
    <div className="chat-room">
      {/* HEADER */}
      <div className="chat-header">
        <div>
          <h2>
            Room: {appState.roomId}
            <button className="copy-btn" onClick={copyRoomId} title="Copy Room ID">
              📋
            </button>
          </h2>
          <p>
            Nickname: {appState.nickname}
            {appState.isHost && <span className="host-badge">👑 Host</span>}
          </p>
        </div>
        <div className="meeting-controls">
          {appState.isHost ? (
            <button className="end-meeting-btn" onClick={handleEndMeeting} title="End meeting for everyone">
              ⛔ End Meeting
            </button>
          ) : (
            <button className="leave-meeting-btn" onClick={handleLeaveMeeting} title="Leave meeting">
              🚪 Leave
            </button>
          )}
        </div>
      </div>

      {/* MESSAGES */}
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <p className="empty-title">No messages yet</p>
            <p className="empty-subtitle">Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={msg.messageId ?? `${msg.permId}-${index}`}
              className={`message-wrapper ${
                msg.isSystemMessage ? 'system' : ''
              } ${
                msg.userNickname === appState.nickname
                  ? 'own-message'
                  : 'other-message'
              }`}
            >
              {msg.isSystemMessage ? (
                <div className="system-message">
                  <span className="system-icon">ℹ️</span>
                  {formatSystemMessage(msg)}
                </div>
              ) : (
                <div className="message">
                  {msg.userNickname !== appState.nickname && (
                    <div className="message-avatar">{msg.userIcon}</div>
                  )}
                  <div className="message-content">
                    {msg.userNickname !== appState.nickname && (
                      <div className="message-sender">{msg.userNickname}</div>
                    )}
                    <div className="message-bubble">
                      <p className="message-text">{msg.body}</p>
                      <span className="message-time">
                        {formatTimestamp(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                  {msg.userNickname === appState.nickname && (
                    <div className="message-avatar">{msg.userIcon}</div>
                  )}
                </div>
              )}
            </div>
          ))
        )}

        {getTypingText() && (
          <div className="typing-indicator">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="typing-text">{getTypingText()}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="message-input-container">
        <input
          type="text"
          className="message-input"
          value={messageInput}
          placeholder="Type a message..."
          onChange={e => {
            setMessageInput(e.target.value);
            e.target.value ? startTyping() : stopTyping();
          }}
          onKeyPress={handleKeyPress}
        />
        <button
          className="send-button"
          onClick={handleSendMessage}
          disabled={!messageInput.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
