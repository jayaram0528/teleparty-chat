# Teleparty Chat Application

A real-time chat application built for the Teleparty technical challenge. This project demonstrates WebSocket communication, React state management, and TypeScript implementation.

## Live Demo

The application is deployed and accessible at: https://jayaram0528.github.io/teleparty-chat

You can test it by opening two browser windows and creating/joining the same room to see real-time messaging in action.

## About This Project

This chat application allows users to create private chat rooms or join existing ones using a room ID. Messages are delivered in real-time using WebSocket connections through the Teleparty WebSocket library. The interface is designed to be clean and intuitive, with a modern gradient background and smooth animations.

## Key Features

The application includes all the required functionality from the assignment brief:

- Users can create new chat rooms and receive a unique room ID
- Users can join existing rooms by entering the room ID
- Real-time messaging between all users in the same room
- Custom nicknames that users set when creating or joining rooms
- Previous messages are loaded automatically when someone joins a room
- Typing indicators show when other users are composing messages
- System messages announce when users join or leave the room

## Technical Implementation

The project is built using modern web technologies and follows best practices for React development:

- React 18 with functional components and hooks
- TypeScript for type safety throughout the application
- WebSocket communication using the teleparty-websocket-lib
- Custom CSS with animations and responsive design
- Proper state management using React hooks
- Component-based architecture for maintainability

## Project Structure

The source code is organized into logical components:

- App.tsx contains the main application logic and WebSocket client initialization
- CreateRoom.tsx handles room creation functionality
- JoinRoom.tsx manages the room joining interface
- ChatRoom.tsx is the main chat interface where messages are displayed
- chat.types.ts defines TypeScript interfaces for type safety
- App.css contains all styling with custom animations

## Installation and Setup

To run this project locally on your machine:

First, clone the repository:
git clone https://github.com/jayaram0528/teleparty-chat.git
cd teleparty-chat

Install the required dependencies:
npm install


Start the development server:
npm start


The application will open in your browser at http://localhost:3000

## How to Use

Using the application is straightforward:

To create a new room, enter your desired nickname and click the Create Room button. You will receive a unique room ID that you can share with others.

To join an existing room, enter the room ID that was shared with you along with your nickname, then click Join Room.

Once in a room, you can type messages in the input field at the bottom. Press Enter or click Send to share your message with everyone in the room.

The application shows typing indicators when other users are composing messages, and system messages appear when users join or leave the room.

## Assignment Requirements

This project fulfills all the functional requirements specified in the Teleparty challenge:

All core features are implemented including room creation, room joining, sending messages, setting nicknames, viewing messages from all users, loading message history, and showing typing presence.

The technical requirements are also met with a React and TypeScript implementation deployed to GitHub Pages as a publicly accessible application.

## Development Notes

During development, I learned about WebSocket lifecycle management and the importance of proper connection handling. The application handles connection states gracefully and provides appropriate user feedback.

The typing indicator feature uses debouncing to avoid sending excessive presence updates to the server. Messages are stored in React state and displayed in chronological order with timestamps.

System messages are differentiated from regular chat messages with a distinct visual style to make it clear when users join or leave the room.

## Known Behavior

The WebSocket connection may close after a few minutes of complete inactivity. This is normal server behavior to conserve resources. If this happens, users can refresh the page to reconnect to their room.

The application works best in modern browsers that fully support WebSocket connections and CSS animations.

## Deployment

The application is deployed using GitHub Pages. The deployment process uses gh-pages to publish the production build to a separate branch.

To deploy updates, run:
npm run deploy


## Repository

Source code: https://github.com/jayaram0528/teleparty-chat

## Author

This project was completed by Jayaram as part of the Teleparty technical challenge. The implementation took approximately 3 hours and demonstrates proficiency in React, TypeScript, WebSocket communication, and modern frontend development practices.

## License

This project is open source and available for educational purposes.
