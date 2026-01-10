import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContextNew';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { user } = await login(formData.email, formData.password);
      toast.success('Welcome back!');
      
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Left Side - Welcome Back */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 p-12 flex-col justify-center">
        <div className="max-w-md">
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-primary-600 font-bold text-lg">P</span>
            </div>
            <span className="text-white font-bold text-2xl">PeerLearn</span>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-6">
            Welcome Back
          </h1>
          <p className="text-primary-100 text-lg mb-8">
            Continue your learning journey with peer mentors and real-time academic support.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-primary-100">
              <div className="w-2 h-2 bg-primary-300 rounded-full"></div>
              <span>Access to expert mentors</span>
            </div>
            <div className="flex items-center space-x-3 text-primary-100">
              <div className="w-2 h-2 bg-primary-300 rounded-full"></div>
              <span>Real-time chat support</span>
            </div>
            <div className="flex items-center space-x-3 text-primary-100">
              <div className="w-2 h-2 bg-primary-300 rounded-full"></div>
              <span>Track your progress</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Sign In</h2>
            <p className="text-dark-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-500 hover:text-primary-400 font-medium">
                Create one
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-5 h-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-10 w-full"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-5 h-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-10 pr-10 w-full"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-dark-400 mt-1">
                Use your Addis Ababa University email ending with @aau.edu.et
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-dark-600 rounded bg-dark-800"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-dark-300">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="text-primary-500 hover:text-primary-400 font-medium">
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="loading-spinner"></div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dark-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-dark-900 text-dark-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="w-full inline-flex justify-center py-2 px-4 border border-dark-600 rounded-lg bg-dark-800 text-sm font-medium text-white hover:bg-dark-700 transition-colors duration-200">
                <span>Google</span>
              </button>
              <button className="w-full inline-flex justify-center py-2 px-4 border border-dark-600 rounded-lg bg-dark-800 text-sm font-medium text-white hover:bg-dark-700 transition-colors duration-200">
                <span>GitHub</span>
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/"
              className="text-dark-400 hover:text-white text-sm font-medium"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;