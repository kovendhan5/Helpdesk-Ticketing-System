import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const { user, token } = useAuth();

  useEffect(() => {
    if (!token || !user) {
      // No authentication, disconnect if connected
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Create socket connection
    const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:3001', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('🔌 WebSocket connected');
      setIsConnected(true);
      setConnectionError(null);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('🔌 WebSocket connection error:', error);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    // Authentication error handler
    newSocket.on('auth_error', (error) => {
      console.error('🔐 WebSocket authentication error:', error);
      setConnectionError('Authentication failed');
      newSocket.disconnect();
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [token, user]);

  // Function to emit events
  const emit = (event, data) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    }
  };

  // Function to subscribe to events
  const on = (event, callback) => {
    if (socket) {
      socket.on(event, callback);
      // Return unsubscribe function
      return () => socket.off(event, callback);
    }
    return () => {};
  };

  // Function to join a room
  const joinRoom = (room) => {
    if (socket && isConnected) {
      socket.emit('join_room', room);
    }
  };

  // Function to leave a room
  const leaveRoom = (room) => {
    if (socket && isConnected) {
      socket.emit('leave_room', room);
    }
  };

  const value = {
    socket,
    isConnected,
    connectionError,
    emit,
    on,
    joinRoom,
    leaveRoom
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
