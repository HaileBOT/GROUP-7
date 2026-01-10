import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContextNew';
import { chatAPI, sessionAPI } from '../services/api';
import socketService from '../services/socket';
import RatingModal from '../components/RatingModal';
import { 
  Send, 
  Phone, 
  Video, 
  MoreVertical,
  ArrowLeft,
  Clock,
  User
} from 'lucide-react';
import toast from 'react-hot-toast';

const ChatPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { userData, getIdToken } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [session, setSession] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(null); // in minutes
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Timer effect for session duration
  useEffect(() => {
    if (sessionDuration && sessionStartTime) {
      timerIntervalRef.current = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now - sessionStartTime) / 1000 / 60); // minutes
        
        if (elapsed < 0) {
          // Session hasn't started yet
          setTimeRemaining(Math.abs(elapsed)); // Store positive minutes until start
        } else {
          const remaining = sessionDuration - elapsed;
          setTimeRemaining(remaining);
          
          // Auto-end session when time expires
          if (remaining <= 0) {
            clearInterval(timerIntervalRef.current);
            handleSessionTimeExpired();
          }
        }
      }, 1000);
      
      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
      };
    }
  }, [sessionDuration, sessionStartTime]);

  const isSessionFuture = sessionStartTime && new Date() < sessionStartTime;

  const handleNewMessage = useCallback((message) => {
    console.log('Received message:', message);
    setMessages(prev => {
      // Prevent duplicate messages
      if (prev.some(m => m.id === message.id)) {
        console.log('Duplicate message ignored:', message.id);
        return prev;
      }
      return [...prev, message];
    });
  }, []);

  const handleTyping = useCallback((data) => {
    if (data.userId !== userData?.uid) {
      setTyping(true);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to hide typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        setTyping(false);
      }, 3000);
    }
  }, [userData?.uid]);

  const handleStopTyping = useCallback((data) => {
    if (data.userId !== userData?.uid) {
      setTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  }, [userData?.uid]);

  const initializeChat = async () => {
    try {
      const token = await getIdToken();
      
      // Fetch session details
      const activeSessionsResponse = await sessionAPI.getActiveSessions(token);
      const currentSession = activeSessionsResponse.data.find(s => s.id === sessionId);
      
      if (currentSession) {
        setSession(currentSession);
        setSessionStartTime(new Date(currentSession.startedAt));
        
        // Check if session has a duration set
        if (currentSession.duration) {
          setSessionDuration(currentSession.duration);
        }

        // Set other user details
        if (userData.role === 'mentor') {
          const nameParts = currentSession.menteeName.split(' ');
          setOtherUser({
            firstName: nameParts[0],
            lastName: nameParts.slice(1).join(' '),
            profile: currentSession.menteeProfile
          });
        } else {
          const nameParts = currentSession.mentorName.split(' ');
          setOtherUser({
            firstName: nameParts[0],
            lastName: nameParts.slice(1).join(' '),
            profile: currentSession.mentorProfile
          });
        }
      }
      
      // Fetch messages
      const messagesResponse = await chatAPI.getMessages(sessionId, {}, token);
      
      if (!isMounted.current) return;

      setMessages(messagesResponse.data);

      // Connect to socket and join session room
      socketService.connect();
      socketService.joinSession(sessionId);
      
      // Remove any existing listeners to be safe
      socketService.offMessage(handleNewMessage);
      socketService.offTyping(handleTyping);
      socketService.off('user-stop-typing', handleStopTyping);

      // Set up socket listeners
      socketService.onMessage(handleNewMessage);
      socketService.onTyping(handleTyping);
      socketService.onStopTyping(handleStopTyping);

    } catch (error) {
      if (!isMounted.current) return;
      console.error('Error initializing chat:', error);
      toast.error('Failed to load chat');
      navigate('/dashboard');
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    isMounted.current = true;
    if (sessionId) {
      initializeChat();
    }
    
    return () => {
      isMounted.current = false;
      socketService.leaveSession(sessionId);
      socketService.offMessage(handleNewMessage);
      socketService.offTyping(handleTyping);
      socketService.off('user-stop-typing', handleStopTyping);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [sessionId, handleNewMessage, handleTyping, handleStopTyping]);



  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      const token = await getIdToken();
      
      // Send message via API
      await chatAPI.sendMessage({
        sessionId,
        text: messageText
      }, token);

      // Message will be added via socket listener
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setNewMessage(messageText); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    // Send typing indicator
    socketService.sendTyping(sessionId, userData?.uid);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to send stop typing
    typingTimeoutRef.current = setTimeout(() => {
      socketService.sendStopTyping(sessionId, userData?.uid);
    }, 1000);
  };

  const handleSessionTimeExpired = async () => {
    toast.warning('Session time has expired');
    await endSession();
  };

  const endSession = async () => {
    try {
      const token = await getIdToken();
      await sessionAPI.endSession(sessionId, {
        summary: 'Session completed successfully'
      }, token);
      
      toast.success('Session ended successfully');
      
      // Show rating modal for mentees
      if (userData?.role === 'mentee') {
        setShowRatingModal(true);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error ending session:', error);
      toast.error('Failed to end session');
    }
  };

  const handleRatingSubmitted = (rating) => {
    // Rating submitted successfully, navigate to dashboard
    navigate('/dashboard');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-dark-900">
      {/* Chat Header */}
      <div className="bg-dark-800 border-b border-dark-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 text-dark-400 hover:text-white transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center overflow-hidden">
                {otherUser?.profile?.photoURL ? (
                  <img 
                    src={otherUser.profile.photoURL} 
                    alt="User" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <h2 className="font-semibold text-white">
                  {otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : (userData?.role === 'mentor' ? 'Student' : 'Mentor')}
                </h2>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-dark-400">Online</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {timeRemaining !== null && (
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                isSessionFuture 
                  ? 'bg-blue-500/20 text-blue-400'
                  : timeRemaining < 5 
                    ? 'bg-red-500/20 text-red-400' 
                    : 'bg-dark-700 text-white'
              }`}>
                <Clock className="w-4 h-4" />
                <span className="font-medium text-sm">
                  {isSessionFuture 
                    ? `Starts in ${Math.floor(timeRemaining)}m`
                    : `${Math.floor(timeRemaining)}m remaining`
                  }
                </span>
              </div>
            )}
            <button className="p-2 text-dark-400 hover:text-white transition-colors duration-200">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2 text-dark-400 hover:text-white transition-colors duration-200">
              <Video className="w-5 h-5" />
            </button>
            {userData?.role === 'mentee' && (
              <button
                onClick={endSession}
                className="btn-primary text-sm px-4 py-2"
              >
                End Session
              </button>
            )}
            <button className="p-2 text-dark-400 hover:text-white transition-colors duration-200">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-dark-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Start the conversation</h3>
            <p className="text-dark-400">Send a message to begin your mentoring session</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.senderId === userData?.uid;
            
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwnMessage
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-700 text-white'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwnMessage ? 'text-primary-200' : 'text-dark-400'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}

        {/* Typing Indicator */}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-dark-700 px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-dark-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-dark-800 border-t border-dark-700 p-4">
        {isSessionFuture ? (
          <div className="text-center py-2 text-dark-400 bg-dark-700/30 rounded-lg border border-dark-700">
            <p className="text-sm">
              This session is scheduled to start at {sessionStartTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
              <br />
              Chat will be enabled when the session starts.
            </p>
          </div>
        ) : (
          <form onSubmit={sendMessage} className="flex space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="flex-1 input-field"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {sending ? (
                <div className="loading-spinner w-4 h-4"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        )}
      </div>

      {/* Rating Modal */}
      <RatingModal
        isOpen={showRatingModal}
        onClose={() => {
          setShowRatingModal(false);
          navigate('/dashboard');
        }}
        session={{ id: sessionId, mentorId: session?.mentorId }}
        onRatingSubmitted={handleRatingSubmitted}
      />
    </div>
  );
};

export default ChatPage;