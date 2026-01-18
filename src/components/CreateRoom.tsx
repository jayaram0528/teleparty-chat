import React, { useState } from 'react';
import { TelepartyClient } from 'teleparty-websocket-lib';
import { AppState } from '../types/chat.types';

interface CreateRoomProps {
  client: TelepartyClient | null;
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

const CreateRoom: React.FC<CreateRoomProps> = ({ client, appState, setAppState }) => {
  const [nickname, setNickname] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateRoom = async () => {
    if (!client || !appState.isConnected) {
      alert('Please wait for connection to be ready');
      return;
    }

    if (!nickname.trim()) {
      alert('Please enter a nickname');
      return;
    }

    setIsCreating(true);
    try {
      const roomId = await client.createChatRoom(nickname.trim(), appState.userIcon);
      console.log('Room created:', roomId);
      setAppState(prev => ({
        ...prev,
        roomId,
        nickname: nickname.trim(),
        inRoom: true,
        isHost: true  // Creator is the host
      }));
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room. Please try again.');
      setIsCreating(false);
    }
  };

  return (
    <div className="room-action">
      <h2>Create a New Room</h2>
      <input
        type="text"
        placeholder="Enter your nickname"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        disabled={!appState.isConnected || isCreating}
        maxLength={20}
      />
      <button 
        onClick={handleCreateRoom}
        disabled={!appState.isConnected || isCreating}
      >
        {isCreating ? 'Creating...' : 'Create Room'}
      </button>
    </div>
  );
};

export default CreateRoom;
