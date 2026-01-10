import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContextNew';
import { notificationAPI } from '../services/api';
import { 
  Home, 
  Users, 
  BookOpen, 
  MessageCircle, 
  User, 
  LogOut,
  Settings,
  Bell,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const Layout = ({ children }) => {
  const { userData, logout, getIdToken } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = await getIdToken();
      const response = await notificationAPI.getNotifications(token);
      setNotifications(response.data);
      setUnreadCount(response.data.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = await getIdToken();
      await notificationAPI.markAsRead(notificationId, token);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = await getIdToken();
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      await Promise.all(unreadIds.map(id => notificationAPI.markAsRead(id, token)));
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  useEffect(() => {
    if (userData) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [userData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  let navigation = [];

  if (userData?.role === 'admin') {
    navigation = [
      { name: 'Dashboard', href: '/admin', icon: Home },
    ];
  } else {
    navigation = [
      { name: 'Dashboard', href: '/dashboard', icon: Home },
      userData?.role === 'mentor' 
        ? { name: 'Students', href: '/students', icon: Users }
        : { name: 'Mentors', href: '/mentors', icon: Users },
      { name: 'Courses', href: '/courses', icon: BookOpen },
      { name: 'Messages', href: '/messages', icon: MessageCircle },
    ];
  }

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Navigation Header */}
      <nav className="bg-dark-800 border-b border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Navigation */}
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to={userData?.role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">P</span>
                  </div>
                  <span className="text-white font-bold text-xl">PeerLearn</span>
                </Link>
              </div>
              
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                        isActive(item.href)
                          ? 'border-primary-500 text-white'
                          : 'border-transparent text-dark-300 hover:border-dark-500 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-dark-400 hover:text-white transition-colors duration-200 relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-dark-800 rounded-xl shadow-lg border border-dark-700 overflow-hidden z-50">
                    <div className="p-4 border-b border-dark-700 flex justify-between items-center">
                      <h3 className="text-sm font-semibold text-white">Notifications</h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-xs text-primary-400 hover:text-primary-300"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div 
                            key={notification.id}
                            className={`p-4 border-b border-dark-700 hover:bg-dark-700 transition-colors cursor-pointer ${
                              !notification.read ? 'bg-dark-700/50' : ''
                            }`}
                            onClick={() => !notification.read && markAsRead(notification.id)}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <h4 className={`text-sm font-medium ${!notification.read ? 'text-white' : 'text-dark-300'}`}>
                                {notification.title}
                              </h4>
                              <span className="text-xs text-dark-500">
                                {new Date(notification.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs text-dark-400 mb-2">
                              {notification.message}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-dark-400 text-sm">
                          No notifications
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Dropdown */}
              <div className="relative">
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">
                      {userData?.firstName} {userData?.lastName}
                    </p>
                    <p className="text-xs text-dark-400 capitalize">
                      {userData?.role}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Link
                      to="/profile"
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-primary-500 transition-all"
                    >
                      {userData?.profile?.photoURL ? (
                        <img 
                          src={userData.profile.photoURL} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-white" />
                      )}
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="p-2 text-dark-400 hover:text-primary-500 transition-colors duration-200"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'border-transparent text-dark-300 hover:bg-dark-700 hover:border-dark-500 hover:text-white'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className="w-4 h-4 mr-3" />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default Layout;