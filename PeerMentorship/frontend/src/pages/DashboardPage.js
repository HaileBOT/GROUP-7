import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContextNew';
import { sessionAPI, userAPI, ratingAPI, questionAPI } from '../services/api';
import { 
  Users, 
  BookOpen, 
  MessageCircle, 
  Star, 
  Clock,
  TrendingUp,
  Calendar,
  Award,
  HelpCircle,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye,
  UserCheck,
  Target,
  BarChart3,
  X,
  Send
} from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const { userData, getIdToken } = useAuth();
  const navigate = useNavigate();
  const [activeSessions, setActiveSessions] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [pendingSessions, setPendingSessions] = useState([]);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [scheduledTime, setScheduledTime] = useState('');
  const [acceptingSession, setAcceptingSession] = useState(null);
  const [answerForm, setAnswerForm] = useState({
    answer: '',
    offerSession: false
  });
  const [stats, setStats] = useState({
    totalSessions: 0,
    averageRating: 0,
    totalHours: 0,
    activeMentees: 0,
    questionsAnswered: 0,
    helpfulRatings: 0
  });
  const [dataLoaded, setDataLoaded] = useState({
    sessions: false,
    stats: false,
    recent: false,
    questions: false,
    pending: false
  });

  useEffect(() => {
    if (userData) {
      fetchDashboardData();
    }
  }, [userData]);

  const fetchDashboardData = async () => {
    try {
      const token = await getIdToken();
      if (!token) return;
      
      // Fetch active sessions
      fetchActiveSessions(token);
      
      // Fetch recent sessions
      fetchRecentSessions(token);
      
      // Role-specific data
      if (userData?.role === 'mentor') {
        fetchMentorStats(token);
        fetchMentorQuestions(token);
        fetchPendingSessions(token);
      } else {
        fetchMenteeQuestions(token);
        setDataLoaded(prev => ({ ...prev, stats: true, pending: true }));
      }

    } catch (error) {
      console.error('Error in fetchDashboardData:', error);
    }
  };

  const fetchActiveSessions = async (token) => {
    try {
      const response = await sessionAPI.getActiveSessions(token);
      setActiveSessions(response.data || []);
    } catch (error) {
      console.error('Error fetching active sessions:', error);
      setActiveSessions([]);
    } finally {
      setDataLoaded(prev => ({ ...prev, sessions: true }));
    }
  };

  const fetchRecentSessions = async (token) => {
    try {
      const response = await sessionAPI.getSessionLogs({ limit: 3 }, token);
      setRecentSessions(response.data || []);
    } catch (error) {
      console.error('Error fetching recent sessions:', error);
      setRecentSessions([]);
    } finally {
      setDataLoaded(prev => ({ ...prev, recent: true }));
    }
  };

  const fetchMentorStats = async (token) => {
    if (!userData?.uid) return;
    
    try {
      const response = await ratingAPI.getMentorStats(userData.uid);
      setStats(prev => ({
        ...prev,
        averageRating: response.data?.averageRating || 0,
        totalSessions: response.data?.totalCompletedSessions || response.data?.totalRatings || 0,
        helpfulRatings: Math.floor((response.data?.averageRating || 0) * (response.data?.totalRatings || 0))
      }));
    } catch (error) {
      console.error('Error fetching mentor stats:', error);
    } finally {
      setDataLoaded(prev => ({ ...prev, stats: true }));
    }
  };

  const fetchMentorQuestions = async (token) => {
    try {
      console.log('Fetching mentor questions for user:', userData);
      if (!userData?.uid) {
        console.log('No user UID found');
        return;
      }
      
      const response = await questionAPI.getQuestionsForMentor(userData.uid, { limit: 5 });
      console.log('Mentor questions response:', response.data);
      setQuestions(response.data || []);
    } catch (error) {
      console.error('Error fetching mentor questions:', error);
      setQuestions([]);
    } finally {
      setDataLoaded(prev => ({ ...prev, questions: true }));
    }
  };

  const fetchMenteeQuestions = async (token) => {
    try {
      const response = await questionAPI.getQuestions({ menteeId: userData.uid, limit: 5 });
      setQuestions(response.data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setQuestions([]);
    } finally {
      setDataLoaded(prev => ({ ...prev, questions: true }));
    }
  };

  const fetchPendingSessions = async (token) => {
    try {
      const response = await sessionAPI.getPendingSessions(token);
      setPendingSessions(response.data || []);
    } catch (error) {
      console.error('Error fetching pending sessions:', error);
      setPendingSessions([]);
    } finally {
      setDataLoaded(prev => ({ ...prev, pending: true }));
    }
  };

  const handleAnswerQuestion = (question) => {
    setSelectedQuestion(question);
    setShowAnswerModal(true);
  };

  const handleSubmitAnswer = async () => {
    try {
      const token = await getIdToken();
      if (!token) return;

      await questionAPI.answerQuestion(selectedQuestion.id, answerForm, token);
      toast.success('Answer submitted successfully!');
      
      setShowAnswerModal(false);
      setSelectedQuestion(null);
      setAnswerForm({ answer: '', offerSession: false });
      
      // Refresh questions
      fetchMentorQuestions(token);
    } catch (error) {
      console.error('Error answering question:', error);
      toast.error('Failed to submit answer');
    }
  };

  const handleAcceptSession = (sessionId) => {
    setSelectedSessionId(sessionId);
    // Default to current time + 5 minutes
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    setScheduledTime(now.toISOString().slice(0, 16));
    setShowScheduleModal(true);
  };

  const confirmAcceptSession = async () => {
    try {
      setAcceptingSession(selectedSessionId);
      const token = await getIdToken();
      if (!token) return;

      await sessionAPI.acceptSession(selectedSessionId, { scheduledTime }, token);
      toast.success('Session scheduled and accepted!');
      
      setShowScheduleModal(false);
      setSelectedSessionId(null);
      
      // Refresh data
      fetchPendingSessions(token);
      fetchActiveSessions(token);
      
      // Navigate to chat
      navigate(`/chat/${selectedSessionId}`);
    } catch (error) {
      console.error('Error accepting session:', error);
      toast.error(error.response?.data?.error || 'Failed to accept session');
    } finally {
      setAcceptingSession(null);
    }
  };

  const renderMenteeDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-blue-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {userData?.firstName}! 👋</h2>
        <p className="text-primary-100 mb-4">Ready to continue your learning journey?</p>
        <div className="flex flex-wrap gap-3">
          <Link to="/mentors" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
            Find Mentors
          </Link>
          <Link to="/courses" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
            Browse Courses
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/mentors" className="card hover:bg-dark-700 transition-colors duration-200 cursor-pointer group">
          <div className="flex items-center space-x-4">
            <div className="bg-primary-600 p-3 rounded-lg group-hover:bg-primary-500 transition-colors">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Find Mentors</h3>
              <p className="text-dark-400 text-sm">Connect with expert mentors</p>
            </div>
          </div>
        </Link>

        <Link to="/ask-question" className="card hover:bg-dark-700 transition-colors duration-200 cursor-pointer group">
          <div className="flex items-center space-x-4">
            <div className="bg-green-600 p-3 rounded-lg group-hover:bg-green-500 transition-colors">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Ask Questions</h3>
              <p className="text-dark-400 text-sm">Get help from the community</p>
            </div>
          </div>
        </Link>

        <div className="card">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-600 p-3 rounded-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Active Chats</h3>
              <p className="text-dark-400 text-sm">
                {dataLoaded.sessions ? `${activeSessions.length} ongoing` : 'Loading...'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Sessions */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Active Sessions</h2>
            <Link to="/messages" className="text-primary-500 hover:text-primary-400 text-sm">
              View All
            </Link>
          </div>
          {!dataLoaded.sessions ? (
            <div className="flex items-center justify-center py-8">
              <div className="loading-spinner"></div>
            </div>
          ) : activeSessions.length > 0 ? (
            <div className="space-y-4">
              {activeSessions.map((session) => (
                <div key={session.id} className="bg-dark-700 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">Session with Mentor</h3>
                    <p className="text-dark-400 text-sm">
                      Started {session.startedAt ? new Date(session.startedAt).toLocaleTimeString() : 'Recently'} • 45 min
                    </p>
                  </div>
                  <Link to={`/chat/${session.id}`} className="btn-primary">
                    Join Chat
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-dark-600 mx-auto mb-4" />
              <p className="text-dark-400 mb-2">No active sessions</p>
              <Link to="/mentors" className="text-primary-500 hover:text-primary-400 text-sm">
                Find a mentor to start learning →
              </Link>
            </div>
          )}
        </div>

        {/* My Questions */}
        <div className="card" id="ask-question">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">My Questions</h2>
            <Link to="/ask-question" className="bg-primary-600 hover:bg-primary-700 px-3 py-1 rounded-lg text-sm flex items-center space-x-1">
              <Plus className="w-4 h-4" />
              <span>Ask Question</span>
            </Link>
          </div>
          {!dataLoaded.questions ? (
            <div className="flex items-center justify-center py-8">
              <div className="loading-spinner"></div>
            </div>
          ) : questions.length > 0 ? (
            <div className="space-y-4">
              {questions.map((question) => (
                <div key={question.id} className="bg-dark-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white text-sm">{question.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      question.status === 'open' ? 'bg-yellow-600 text-yellow-100' :
                      question.status === 'answered' ? 'bg-green-600 text-green-100' :
                      'bg-gray-600 text-gray-100'
                    }`}>
                      {question.status}
                    </span>
                  </div>
                  <p className="text-dark-400 text-sm line-clamp-2">{question.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <HelpCircle className="w-12 h-12 text-dark-600 mx-auto mb-4" />
              <p className="text-dark-400 mb-2">No questions yet</p>
              <p className="text-dark-500 text-sm">Ask your first question to get help from mentors</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-xl font-bold text-white mb-6">Recent Learning Activity</h2>
        {recentSessions.length > 0 ? (
          <div className="space-y-4">
            {recentSessions.map((session) => (
              <div key={session.id} className="bg-dark-700 rounded-lg p-4 flex items-center space-x-4">
                <div className="bg-green-600 p-2 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">Completed mentoring session</h3>
                  <p className="text-dark-400 text-sm">
                    {session.endedAt ? new Date(session.endedAt).toLocaleDateString() : 'Recently'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-dark-400 text-sm">Duration</p>
                  <p className="text-white font-semibold">45 min</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-dark-600 mx-auto mb-4" />
            <p className="text-dark-400">No recent activity</p>
            <p className="text-dark-500 text-sm">Your learning sessions will appear here</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderMentorDashboard = () => (
    <div className="space-y-8">
      {/* Mentor Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome, Mentor {userData?.firstName}! 🎓</h2>
        <p className="text-purple-100 mb-4">Ready to help students succeed today?</p>
        <div className="flex items-center space-x-6 text-purple-100">
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5" />
            <span>{stats.averageRating || 0} avg rating</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>{stats.totalSessions || 0} students helped</span>
          </div>
        </div>
      </div>

      {/* Mentor Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">
                {dataLoaded.stats ? stats.totalSessions : '...'}
              </h3>
              <p className="text-dark-400 text-sm">Students Mentored</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-4">
            <div className="bg-yellow-600 p-3 rounded-lg">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">
                {dataLoaded.stats ? stats.averageRating : '...'}
              </h3>
              <p className="text-dark-400 text-sm">Average Rating</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-4">
            <div className="bg-green-600 p-3 rounded-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">
                {dataLoaded.sessions ? activeSessions.length : '...'}
              </h3>
              <p className="text-dark-400 text-sm">Active Sessions</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-4">
            <div className="bg-purple-600 p-3 rounded-lg">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">
                {dataLoaded.stats ? stats.helpfulRatings : '...'}
              </h3>
              <p className="text-dark-400 text-sm">Helpful Ratings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Session Requests */}
      {pendingSessions.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Pending Session Requests</h2>
            <span className="bg-yellow-600 text-yellow-100 px-2 py-1 rounded text-sm">
              {pendingSessions.length} pending
            </span>
          </div>
          <div className="space-y-4">
            {pendingSessions.slice(0, 3).map((session) => (
              <div key={session.id} className="bg-dark-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white">{session.menteeName}</h3>
                    <p className="text-dark-400 text-sm">{session.description}</p>
                    {session.courseName && (
                      <p className="text-dark-500 text-xs mt-1">Course: {session.courseName}</p>
                    )}
                  </div>
                  <span className="bg-yellow-600 px-2 py-1 rounded text-xs text-white">
                    Pending
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-dark-500">
                    Requested {new Date(session.createdAt).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => handleAcceptSession(session.id)}
                    disabled={acceptingSession === session.id}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1 rounded text-sm text-white flex items-center space-x-1"
                  >
                    {acceptingSession === session.id ? (
                      <>
                        <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Accepting...</span>
                      </>
                    ) : (
                      <span>Accept & Start Chat</span>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Mentoring Sessions */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Active Mentoring</h2>
            <Link to="/messages" className="text-primary-500 hover:text-primary-400 text-sm">
              View All
            </Link>
          </div>
          {!dataLoaded.sessions ? (
            <div className="flex items-center justify-center py-8">
              <div className="loading-spinner"></div>
            </div>
          ) : activeSessions.length > 0 ? (
            <div className="space-y-4">
              {activeSessions.map((session) => (
                <div key={session.id} className="bg-dark-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white">Mentoring Session</h3>
                    <span className="bg-green-600 px-2 py-1 rounded text-xs text-white">Active</span>
                  </div>
                  <p className="text-dark-400 text-sm mb-3">
                    Started {session.startedAt ? new Date(session.startedAt).toLocaleTimeString() : 'Recently'} • 45 min
                  </p>
                  <Link to={`/chat/${session.id}`} className="btn-primary w-full">
                    Continue Session
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <UserCheck className="w-12 h-12 text-dark-600 mx-auto mb-4" />
              <p className="text-dark-400 mb-2">No active sessions</p>
              <p className="text-dark-500 text-sm">Students will request sessions with you</p>
            </div>
          )}
        </div>

        {/* Questions to Answer */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Questions to Answer</h2>
            <Link to="/questions" className="text-primary-500 hover:text-primary-400 text-sm">
              View All
            </Link>
          </div>
          {!dataLoaded.questions ? (
            <div className="flex items-center justify-center py-8">
              <div className="loading-spinner"></div>
            </div>
          ) : questions.length > 0 ? (
            <div className="space-y-4">
              {questions.map((question) => (
                <div key={question.id} className="bg-dark-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white text-sm">{question.title}</h3>
                    <div className="flex items-center space-x-2">
                      {question.relevanceScore && (
                        <span className="px-2 py-1 bg-green-600 text-green-100 rounded text-xs">
                          {Math.round(question.relevanceScore)}% match
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded text-xs ${
                        question.priority === 'high' ? 'bg-red-600 text-red-100' :
                        question.priority === 'medium' ? 'bg-yellow-600 text-yellow-100' :
                        'bg-blue-600 text-blue-100'
                      }`}>
                        {question.priority}
                      </span>
                    </div>
                  </div>
                  
                  {/* Show matching tags */}
                  {question.tags && question.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {question.tags.slice(0, 4).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-primary-600/20 text-primary-300 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {question.tags.length > 4 && (
                        <span className="px-2 py-1 bg-dark-600 text-dark-300 rounded text-xs">
                          +{question.tags.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <p className="text-dark-400 text-sm mb-3 line-clamp-2">{question.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-dark-500">
                      by {question.menteeFirstName} {question.menteeLastName}
                    </div>
                    <button 
                      onClick={() => handleAnswerQuestion(question)}
                      className="bg-primary-600 hover:bg-primary-700 px-3 py-1 rounded text-sm"
                    >
                      Answer Question
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <HelpCircle className="w-12 h-12 text-dark-600 mx-auto mb-4" />
              <p className="text-dark-400 mb-2">No relevant questions found</p>
              <p className="text-dark-500 text-sm">Questions matching your skills will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Mentoring Impact */}
      <div className="card">
        <h2 className="text-xl font-bold text-white mb-6">Your Mentoring Impact</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-dark-700 rounded-lg p-4 text-center">
            <div className="bg-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white">{stats.totalSessions || 0}</h3>
            <p className="text-dark-400 text-sm">Students Helped</p>
          </div>
          
          <div className="bg-dark-700 rounded-lg p-4 text-center">
            <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white">{Math.floor((stats.totalSessions || 0) * 45)}</h3>
            <p className="text-dark-400 text-sm">Minutes Mentored</p>
          </div>
          
          <div className="bg-dark-700 rounded-lg p-4 text-center">
            <div className="bg-purple-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white">{stats.helpfulRatings || 0}</h3>
            <p className="text-dark-400 text-sm">Positive Impact</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Role-based Dashboard */}
      {userData?.role === 'mentor' ? renderMentorDashboard() : renderMenteeDashboard()}

      {/* Answer Question Modal */}
      {showAnswerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Answer Question</h3>
              <button
                onClick={() => setShowAnswerModal(false)}
                className="text-dark-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {selectedQuestion && (
              <div className="mb-4">
                <h4 className="font-medium text-white mb-2">{selectedQuestion.title}</h4>
                <p className="text-dark-400 text-sm mb-3 line-clamp-3">{selectedQuestion.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {selectedQuestion.tags?.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary-600/20 text-primary-300 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Your Answer
                </label>
                <textarea
                  value={answerForm.answer}
                  onChange={(e) => setAnswerForm(prev => ({ ...prev, answer: e.target.value }))}
                  className="textarea-field w-full"
                  rows={4}
                  placeholder="Provide a helpful answer to this question..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="offerSession"
                  checked={answerForm.offerSession}
                  onChange={(e) => setAnswerForm(prev => ({ ...prev, offerSession: e.target.checked }))}
                  className="rounded border-dark-600 bg-dark-700 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="offerSession" className="text-sm text-white">
                  Offer a mentoring session (will create a session request)
                </label>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAnswerModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!answerForm.answer.trim()}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Send className="w-4 h-4 mr-1" />
                  Submit Answer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Session Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Schedule Session</h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-dark-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Select Start Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="input-field w-full"
                  min={new Date().toISOString().slice(0, 16)}
                />
                <p className="text-xs text-dark-400 mt-1">
                  The session will be active for 45 minutes from this time.
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAcceptSession}
                  disabled={!scheduledTime || acceptingSession}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {acceptingSession ? (
                    <div className="loading-spinner w-4 h-4"></div>
                  ) : (
                    'Confirm & Schedule'
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

export default DashboardPage;