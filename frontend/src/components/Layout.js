import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContextNew';
import { 
  Home, 
  Users, 
  BookOpen, 
  MessageCircle, 
  User, 
  LogOut,
  Settings,
  Bell
} from 'lucide-react';
import toast from 'react-hot-toast';

const Layout = ({ children }) => {
  const { userData, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Mentors', href: '/mentors', icon: Users },
    { name: 'Courses', href: '/courses', icon: BookOpen },
    { name: 'Messages', href: '/messages', icon: MessageCircle },
  ];

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
                <Link to="/dashboard" className="flex items-center space-x-2">
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
              <button className="p-2 text-dark-400 hover:text-white transition-colors duration-200">
                <Bell className="w-5 h-5" />
              </button>

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
                      className="p-2 text-dark-400 hover:text-white transition-colors duration-200"
                    >
                      <User className="w-5 h-5" />
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