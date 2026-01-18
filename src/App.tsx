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
        // Load previous messages on join
        if (Array.isArray(message.data?.messages)) {
          console.log('📜 Loading previous messages');
          setMessages(message.data.messages);
        }
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
      // Send ONLY body to server - server will add all other fields and broadcast
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
