export interface ChatMessage {
  body: string;
  isSystemMessage: boolean;
  timestamp: number;
  permId: string;

  // optional fields provided by server / UI
  userNickname?: string;
  userIcon?: string;

  // ✅ ADD THIS (Teleparty server sends this)
  messageId?: string;
}

export interface AppState {
  isConnected: boolean;
  roomId: string | null;
  nickname: string;
  userIcon: string;
  inRoom: boolean;
  isHost: boolean;
}

export interface TypingUser {
  permId: string;
  nickname: string;
}
