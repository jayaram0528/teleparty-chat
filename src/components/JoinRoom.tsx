import React, { useState } from 'react';
import { TelepartyClient } from 'teleparty-websocket-lib';
import { AppState } from '../types/chat.types';

interface JoinRoomProps {
  client: TelepartyClient | null;
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

const JoinRoom: React.FC<JoinRoomProps> = ({ client, appState, setAppState }) => {
  const [nickname, setNickname] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinRoom = async () => {
    if (!client || !appState.isConnected) {
      alert('Please wait for connection to be ready');
      return;
    }

    if (!nickname.trim()) {
      alert('Please enter a nickname');
      return;
    }

    if (!roomId.trim()) {
      alert('Please enter a room ID');
      return;
    }

    setIsJoining(true);
    try {
      await client.joinChatRoom(nickname.trim(), roomId.trim(), appState.userIcon);
      console.log('Joined room:', roomId.trim());
      setAppState(prev => ({
        ...prev,
        roomId: roomId.trim(),
        nickname: nickname.trim(),
        inRoom: true,
        isHost: false  // Joiners are not hosts
      }));
    } catch (error) {
      console.error('Error joining room:', error);
      alert('Failed to join room. Please check the room ID and try again.');
      setIsJoining(false);
    }
  };

  return (
    <div className="room-action">
      <h2>Join Existing Room</h2>
      <input
        type="text"
        placeholder="Enter your nickname"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        disabled={!appState.isConnected || isJoining}
        maxLength={20}
      />
      <input
        type="text"
        placeholder="Enter room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        disabled={!appState.isConnected || isJoining}
      />
      <button 
        onClick={handleJoinRoom}
        disabled={!appState.isConnected || isJoining}
      >
        {isJoining ? 'Joining...' : 'Join Room'}
      </button>
    </div>
  );
};

export default JoinRoom;
