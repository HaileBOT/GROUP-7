import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContextNew';
import { sessionAPI } from '../services/api';
import { 
  MessageCircle, 
  Clock, 
  User, 
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const MessagesPage = () => {
  const { userData, getIdToken } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, completed, requested
  const [searchTerm, setSearchTerm] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [scheduledTime, setScheduledTime] = useState('');
  const [acceptingSession, setAcceptingSession] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const token = await getIdToken();
      
      // Fetch active sessions
      const activeResponse = await sessionAPI.getActiveSessions(token);
      const activeSessions = activeResponse.data || [];

      // Fetch pending sessions (for mentors)
      let pendingSessions = [];
      if (userData?.role === 'mentor') {
        try {
          const pendingResponse = await sessionAPI.getPendingSessions(token);
          pendingSessions = pendingResponse.data || [];
        } catch (error) {
          console.log('No pending sessions or error fetching them');
        }
      }

      // Fetch recent completed sessions
      const recentResponse = await sessionAPI.getSessionLogs({ limit: 10 }, token);
      const recentSessions = recentResponse.data || [];

      // Combine all sessions
      const allSessions = [
        ...activeSessions.map(session => ({
          ...session,
          status: 'active',
          otherUser: {
            name: session.otherUser || (userData?.role === 'mentor' ? 'Student' : 'Mentor'),
            role: userData?.role === 'mentor' ? 'mentee' : 'mentor'
          }
        })),
        ...pendingSessions.map(session => ({
          ...session,
          status: 'requested',
          otherUser: {
            name: session.menteeName || 'Student',
            role: 'mentee'
          }
        })),
        ...recentSessions.map(session => ({
          ...session,
          status: 'completed',
          otherUser: {
            name: session.otherUser || (userData?.role === 'mentor' ? 'Student' : 'Mentor'),
            role: userData?.role === 'mentor' ? 'mentee' : 'mentor'
          }
        }))
      ];

      setSessions(allSessions);

    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptSession = (sessionId) => {
    setSelectedSessionId(sessionId);
    setShowScheduleModal(true);
  };

  const confirmAcceptSession = async () => {
    if (!scheduledTime) {
      toast.error('Please select a scheduled time');
      return;
    }

    setAcceptingSession(selectedSessionId);
    try {
      const token = await getIdToken();
      await sessionAPI.acceptSession(selectedSessionId, { scheduledTime }, token);
      toast.success('Session accepted and scheduled!');
      
      setShowScheduleModal(false);
      setScheduledTime('');
      setSelectedSessionId(null);
      
      // Refresh sessions
      fetchSessions();
      
      // Navigate to chat after a short delay
      setTimeout(() => {
        navigate(`/chat/${selectedSessionId}`);
      }, 1000);
    } catch (error) {
      console.error('Error accepting session:', error);
      toast.error(error.response?.data?.error || 'Failed to accept session');
    } finally {
      setAcceptingSession(null);
    }
  };

  const filteredSessions = sessions.filter(session => {
    // Filter by status
    if (filter !== 'all' && session.status !== filter) {
      return false;
    }

    // Filter by search term
    if (searchTerm && !session.otherUser?.name?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    return true;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <div className="w-3 h-3 bg-green-500 rounded-full"></div>;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'requested':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <div className="w-3 h-3 bg-gray-500 rounded-full"></div>;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      case 'requested':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Messages</h1>
        <p className="text-dark-400">
          {userData?.role === 'mentor' 
            ? 'Manage your mentoring conversations' 
            : 'Your mentorship conversations'
          }
        </p>
      </div>

      {/* Filters and Search */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-dark-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Messages</option>
              <option value="active">Active</option>
              <option value="requested">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {filteredSessions.length > 0 ? (
          filteredSessions.map((session) => (
            <div key={session.id} className="card hover:bg-dark-700 transition-colors duration-200">
              <div className="flex items-center space-x-4">
                {/* Avatar */}
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-white truncate">
                      {session.otherUser.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(session.status)}
                      <span className="text-sm text-dark-400">
                        {getStatusText(session.status)}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-dark-400 mb-1 capitalize">
                    {session.otherUser.role}
                  </p>

                  {session.lastMessage && (
                    <p className="text-sm text-dark-300 truncate mb-2">
                      {session.lastMessage.text}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-xs text-dark-500">
                      <Clock className="w-3 h-3" />
                      <span>
                        {session.lastMessage 
                          ? formatTime(session.lastMessage.timestamp)
                          : formatTime(session.startedAt || session.createdAt)
                        }
                        {session.status === 'active' && ' • 45 min session'}
                      </span>
                    </div>

                    {session.status === 'active' && (
                      <Link
                        to={`/chat/${session.id}`}
                        className="btn-primary text-xs px-3 py-1"
                      >
                        Continue Chat
                      </Link>
                    )}

                    {session.status === 'requested' && userData?.role === 'mentor' && (
                      <button 
                        onClick={() => handleAcceptSession(session.id)}
                        className="btn-primary text-xs px-3 py-1"
                      >
                        Accept Request
                      </button>
                    )}

                    {session.status === 'completed' && (
                      <span className="text-xs text-green-400">
                        Session Complete
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No messages found</h3>
            <p className="text-dark-400 mb-6">
              {filter === 'all' 
                ? "You don't have any conversations yet"
                : `No ${filter} conversations found`
              }
            </p>
            {userData?.role === 'mentee' && (
              <Link to="/mentors" className="btn-primary">
                Find a Mentor
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-white">
            {sessions.filter(s => s.status === 'active').length}
          </div>
          <div className="text-dark-400 text-sm">Active Chats</div>
        </div>
        
        <div className="card text-center">
          <div className="text-2xl font-bold text-white">
            {sessions.filter(s => s.status === 'completed').length}
          </div>
          <div className="text-dark-400 text-sm">Completed Sessions</div>
        </div>
        
        <div className="card text-center">
          <div className="text-2xl font-bold text-white">
            {sessions.filter(s => s.status === 'requested').length}
          </div>
          <div className="text-dark-400 text-sm">Pending Requests</div>
        </div>
      </div>

      {/* Schedule Session Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-xl p-6 max-w-md w-full border border-dark-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Schedule Session</h3>
              <button 
                onClick={() => setShowScheduleModal(false)}
                className="text-dark-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Select Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                  min={new Date().toISOString().slice(0, 16)}
                />
                <p className="text-xs text-dark-400 mt-2">
                  Please select a time for the session to start.
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 px-4 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAcceptSession}
                  disabled={acceptingSession || !scheduledTime}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {acceptingSession ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    'Confirm & Accept'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;