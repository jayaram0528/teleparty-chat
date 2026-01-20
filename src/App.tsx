import React, { useState, useEffect, useCallback } from 'react';
import {
  TelepartyClient,
  SocketEventHandler,
  SocketMessageTypes
} from 'teleparty-websocket-lib';

import CreateRoom from './components/CreateRoom';
import JoinRoom from './components/JoinRoom';
import ChatRoom from './components/ChatRoom';
import { AppState, ChatMessage } from './types/chat.types';

import './App.css';

function App() {
  const [client, setClient] = useState<TelepartyClient | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const [appState, setAppState] = useState<AppState>({
    isConnected: false,
    roomId: null,
    nickname: '',
    userIcon: '👤',
    inRoom: false,
    isHost: false
  });

  /**
   * ✅ CENTRAL MESSAGE HANDLER
   * Server is the single source of truth
   */
  const handleMessage = useCallback((message: any) => {
    console.log('📥 Received message:', message);

    // ✅ DEBUG: check if server is sending MessageList (history)
    if (message?.data?.messages) {
      console.log('HISTORY LENGTH:', message.data.messages.length);
    }

    // ✅ Handle MessageList (history) from server when someone joins
    // Teleparty mentions you may receive an object implementing MessageList with data.messages. [file:1]
    if (Array.isArray(message.data?.messages)) {
      console.log('📜 Loading previous messages');

      setMessages(prev => {
        const incoming = message.data.messages as ChatMessage[];

        const makeKey = (m: ChatMessage) =>
          m.messageId ?? `${m.permId}-${m.timestamp}-${m.body}`;

        const seen = new Set(prev.map(makeKey));
        const merged = [...prev];

        for (const m of incoming) {
          const key = makeKey(m);
          if (!seen.has(key)) {
            merged.push(m);
            seen.add(key);
          }
        }

        merged.sort((a, b) => a.timestamp - b.timestamp);
        return merged;
      });

      return; // important: don't fall through into switch for history events
    }

    switch (message.type) {
      case SocketMessageTypes.SEND_MESSAGE: {
        const chatMessage = message.data as ChatMessage;
        if (chatMessage?.body) {
          console.log('✅ Chat message received:', chatMessage);
          setMessages(prev => [...prev, chatMessage]);
        }
        break;
      }

      case SocketMessageTypes.SET_TYPING_PRESENCE: {
        if (message.data?.anyoneTyping && Array.isArray(message.data.usersTyping)) {
          setTypingUsers(message.data.usersTyping);
        } else {
          setTypingUsers([]);
        }
        break;
      }

      default: {
        // no-op
        break;
      }
    }
  }, []);

  /**
   * ✅ SEND MESSAGE TO SERVER
   * Server will broadcast to all users including sender
   */
  const handleSendMessage = useCallback((messageBody: string) => {
    if (!client || !messageBody.trim()) {
      console.log('❌ Cannot send: client not ready or empty message');
      return;
    }

    console.log('📤 Sending message to server:', messageBody);

    try {
      // Send ONLY body to server - server will add all other fields and broadcast [file:1]
      client.sendMessage(SocketMessageTypes.SEND_MESSAGE, {
        body: messageBody.trim()
      });
      console.log('✅ Message sent to server successfully');
    } catch (error) {
      console.error('❌ Error sending message:', error);
    }
  }, [client]);

  /**
   * ✅ INITIALIZE TELEPARTY CLIENT (ONCE)
   */
  useEffect(() => {
    const eventHandler: SocketEventHandler = {
      onConnectionReady: () => {
        console.log('🟢 WebSocket connected');
        setAppState(prev => ({ ...prev, isConnected: true }));
      },

      onClose: () => {
        console.log('🔴 WebSocket disconnected');
        setAppState(prev => ({ ...prev, isConnected: false }));
      },

      onMessage: handleMessage
    };

    const telepartyClient = new TelepartyClient(eventHandler);
    setClient(telepartyClient);

    return () => {
      telepartyClient.teardown();
    };
  }, [handleMessage]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>💬 Teleparty Chat</h1>
        {appState.isConnected ? (
          <span className="status connected">● Connected</span>
        ) : (
          <span className="status connecting">● Connecting...</span>
        )}
      </header>

      <main className="App-main">
        {!appState.inRoom ? (
          <div className="lobby">
            <div className="lobby-header">
              <h2>Welcome to Teleparty Chat! 🎉</h2>
              <p>Create a room or join an existing one to start chatting</p>
            </div>

            <CreateRoom
              client={client}
              appState={appState}
              setAppState={setAppState}
            />

            <div className="divider">OR</div>

            <JoinRoom
              client={client}
              appState={appState}
              setAppState={setAppState}
            />
          </div>
        ) : (
          <ChatRoom
            client={client}
            appState={appState}
            messages={messages}
            typingUsers={typingUsers}
            onSendMessage={handleSendMessage}
          />
        )}
      </main>
    </div>
  );
}

export default App;
