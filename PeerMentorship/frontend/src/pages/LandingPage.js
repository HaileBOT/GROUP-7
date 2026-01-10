import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI, courseAPI } from '../services/api';
import { 
  Users, 
  BookOpen, 
  MessageCircle, 
  Star, 
  ArrowRight,
  CheckCircle,
  Play
} from 'lucide-react';

const LandingPage = () => {
  const [courses, setCourses] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, mentorsRes] = await Promise.all([
          courseAPI.getCourses(),
          userAPI.getMentors()
        ]);
        
        // Get top 4 courses
        setCourses(coursesRes.data.slice(0, 4));
        
        // Get top 4 mentors
        setMentors(mentorsRes.data.slice(0, 4));
      } catch (error) {
        console.error('Error fetching landing page data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const features = [
    {
      icon: Users,
      title: 'Peer-to-Peer Learning',
      description: 'Connect with fellow students and experienced mentors'
    },
    {
      icon: BookOpen,
      title: 'Expert Guidance',
      description: 'Get help from top-performing students in your courses'
    },
    {
      icon: MessageCircle,
      title: 'Real-time Support',
      description: 'Instant messaging and live academic assistance'
    }
  ];

  // Mock data removed, using state instead

  const categories = [
    { name: 'Physics', icon: '⚛️', color: 'bg-blue-500' },
    { name: 'Applied Maths', icon: '📐', color: 'bg-green-500' },
    { name: 'Economics', icon: '📊', color: 'bg-purple-500' },
    { name: 'Statistics', icon: '📉', color: 'bg-orange-500' },
    { name: 'Logic', icon: '🧠', color: 'bg-red-500' },
    { name: 'Psychology', icon: '💭', color: 'bg-yellow-500' }
  ];

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Navigation */}
      <nav className="bg-dark-800 border-b border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="text-white font-bold text-xl">PeerLearn</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-dark-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-gradient py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Learn Together, <span className="text-primary-500">Grow</span> Together
              </h1>
              <p className="text-xl text-dark-300 mb-8 max-w-2xl">
                Connect with peer mentors, get real-time academic support, and accelerate your learning journey with our collaborative platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  to="/register"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 flex items-center justify-center"
                >
                  Start Learning
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <button className="border border-dark-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-dark-800 transition-colors duration-200 flex items-center justify-center">
                  <Play className="mr-2 w-5 h-5" />
                  Watch Demo
                </button>
              </div>

              <div className="flex items-center justify-center lg:justify-start space-x-8 text-dark-400">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">500+</div>
                  <div className="text-sm">Active Students</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">2.5k+</div>
                  <div className="text-sm">Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">50+</div>
                  <div className="text-sm">Courses</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-dark-800 rounded-2xl p-8 border border-dark-700">
                <img 
                  src="data:image/jpeg;base64,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" 
                  alt="Students collaborating" 
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose PeerLearn?
            </h2>
            <p className="text-xl text-dark-400 max-w-3xl mx-auto">
              Our platform connects you with the best peer mentors and provides real-time academic support
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="bg-primary-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                  <p className="text-dark-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Featured Courses</h2>
              <p className="text-dark-400">Popular courses from expert mentors</p>
            </div>
            <Link to="/dashboard" className="text-primary-500 hover:text-primary-400 font-medium flex items-center">
              View All
              <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <div className="col-span-4 text-center text-white">Loading courses...</div>
            ) : courses.length > 0 ? (
              courses.map((course, index) => (
                <div key={index} className="bg-dark-800 rounded-lg overflow-hidden border border-dark-700 hover:border-dark-600 transition-colors duration-200">
                  <div className="h-48 bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-white opacity-50" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-white mb-2">{course.name}</h3>
                    <p className="text-dark-400 text-sm mb-4">{course.department}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-white">4.8</span>
                      </div>
                      <span className="text-sm text-dark-400">120 students</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-4 text-center text-dark-400">No courses found</div>
            )}
          </div>
        </div>
      </section>

      {/* Top Mentors */}
      <section className="py-20 bg-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Top Mentors</h2>
            <p className="text-dark-400">Learn from the best students and industry experts</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <div className="col-span-4 text-center text-white">Loading mentors...</div>
            ) : mentors.length > 0 ? (
              mentors.map((mentor, index) => (
                <div key={index} className="bg-dark-900 rounded-lg p-6 text-center border border-dark-700">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full mx-auto mb-4 overflow-hidden">
                    {mentor.profile?.photoURL ? (
                      <img 
                        src={mentor.profile.photoURL} 
                        alt={`${mentor.firstName} ${mentor.lastName}`} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">
                        {mentor.firstName?.[0]}{mentor.lastName?.[0]}
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-white mb-1">{mentor.firstName} {mentor.lastName}</h3>
                  <p className="text-dark-400 text-sm mb-3">{mentor.profile?.bio?.substring(0, 30) || 'Mentor'}...</p>
                  <div className="flex items-center justify-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-white">4.9</span>
                    </div>
                    <span className="text-dark-400">24 sessions</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-4 text-center text-dark-400">No mentors found</div>
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Explore Categories</h2>
            <p className="text-dark-400">Find mentors and courses in your area of interest</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <div key={index} className="bg-dark-800 rounded-lg p-6 text-center hover:bg-dark-700 transition-colors duration-200 cursor-pointer border border-dark-700">
                <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                  <span className="text-2xl">{category.icon}</span>
                </div>
                <h3 className="font-medium text-white text-sm">{category.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of learners and mentors in our collaborative learning community
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-200"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-primary-600 transition-colors duration-200"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-800 border-t border-dark-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="text-white font-bold text-xl">PeerLearn</span>
              </div>
              <p className="text-dark-400 text-sm">
                Empowering students through peer-to-peer learning and mentorship.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-dark-400 text-sm">
                <li><a href="#" className="hover:text-white">Find Mentors</a></li>
                <li><a href="#" className="hover:text-white">Browse Courses</a></li>
                <li><a href="#" className="hover:text-white">Become a Mentor</a></li>
                <li><a href="#" className="hover:text-white">Community</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-dark-400 text-sm">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-dark-400 text-sm">
                <li><a href="#" className="hover:text-white">Twitter</a></li>
                <li><a href="#" className="hover:text-white">LinkedIn</a></li>
                <li><a href="#" className="hover:text-white">Discord</a></li>
                <li><a href="#" className="hover:text-white">GitHub</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-dark-700 mt-8 pt-8 text-center">
            <p className="text-dark-400 text-sm">
              © 2024 PeerLearn. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;