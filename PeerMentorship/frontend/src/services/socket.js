import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000', {
        transports: ['websocket'],
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        console.log('Connected to server');
        this.isConnected = true;
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from server');
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        this.isConnected = false;
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Join a session room
  joinSession(sessionId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-session', sessionId);
    }
  }

  // Leave a session room
  leaveSession(sessionId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-session', sessionId);
    }
  }

  // Send a message
  sendMessage(messageData) {
    if (this.socket && this.isConnected) {
      this.socket.emit('send-message', messageData);
    }
  }

  // Listen for new messages
  onMessage(callback) {
    if (this.socket) {
      this.socket.on('receive-message', callback);
    }
  }

  // Remove message listener
  offMessage(callback) {
    if (this.socket) {
      this.socket.off('receive-message', callback);
    }
  }

  // Send typing indicator
  sendTyping(sessionId, userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing', { sessionId, userId });
    }
  }

  // Send stop typing indicator
  sendStopTyping(sessionId, userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('stop-typing', { sessionId, userId });
    }
  }

  // Listen for typing indicators
  onTyping(callback) {
    if (this.socket) {
      this.socket.on('user-typing', callback);
    }
  }

  // Listen for stop typing indicators
  onStopTyping(callback) {
    if (this.socket) {
      this.socket.on('user-stop-typing', callback);
    }
  }

  // Remove typing listeners
  offTyping(callback) {
    if (this.socket) {
      this.socket.off('user-typing', callback);
      this.socket.off('user-stop-typing', callback);
    }
  }

  // Listen for mentor rating updates
  onMentorRatingUpdate(callback) {
    if (this.socket) {
      this.socket.on('mentor-rating-updated', callback);
    }
  }

  // Remove mentor rating update listener
  offMentorRatingUpdate(callback) {
    if (this.socket) {
      this.socket.off('mentor-rating-updated', callback);
    }
  }

  // Generic event listener
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Generic event emitter
  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }

  // Remove generic event listener
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;