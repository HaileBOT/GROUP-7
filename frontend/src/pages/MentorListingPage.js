import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContextNew';
import { matchingAPI, sessionAPI, courseAPI } from '../services/api';
import { 
  Users, 
  Star, 
  MessageCircle, 
  Search,
  Filter,
  Clock,
  Award,
  BookOpen,
  ChevronDown,
  User,
  Mail,
  Calendar,
  Target,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

const MentorListingPage = () => {
  const { userData, getIdToken } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, hasMore: false });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await courseAPI.getCourses();
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, [sortBy, selectedCourses]);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const params = {
        sortBy,
        limit: 20,
        offset: 0
      };

      if (selectedCourses.length > 0) {
        params.courses = selectedCourses;
      }

      const response = await matchingAPI.getAllMentors(params);
      setMentors(response.data.mentors || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error('Error fetching mentors:', error);
      toast.error('Failed to load mentors');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseToggle = (courseId) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const requestSession = async (mentorId) => {
    try {
      const token = await getIdToken();
      if (!token) {
        toast.error('Please log in to request a session');
        return;
      }

      await sessionAPI.requestSession({
        mentorId,
        description: 'Session requested from mentor listing'
      }, token);

      toast.success('Session request sent successfully!');
    } catch (error) {
      console.error('Error requesting session:', error);
      toast.error(error.response?.data?.error || 'Failed to request session');
    }
  };

  const filteredMentors = mentors.filter(mentor => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${mentor.first_name} ${mentor.last_name}`.toLowerCase();
    
    const mentorCourses = mentor.profile?.courses?.map(id => {
        const c = courses.find(course => course.id === id);
        return c ? c.name : '';
    }).join(' ').toLowerCase() || '';
    
    const bio = (mentor.bio || '').toLowerCase();
    
    return fullName.includes(searchLower) || 
           mentorCourses.includes(searchLower) || 
           bio.includes(searchLower);
  });

  const renderMentorCard = (mentor) => (
    <div key={mentor.id} className="card hover:bg-dark-700 transition-colors duration-200">
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl overflow-hidden">
          {mentor.profile?.photoURL ? (
            <img 
              src={mentor.profile.photoURL} 
              alt={`${mentor.first_name} ${mentor.last_name}`} 
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{mentor.first_name[0]}{mentor.last_name[0]}</span>
          )}
        </div>

        {/* Mentor Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {mentor.first_name} {mentor.last_name}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-dark-400">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>{mentor.averageRating.toFixed(1)}</span>
                  <span>({mentor.totalRatings} reviews)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{mentor.totalSessions} sessions</span>
                </div>
              </div>
            </div>
            
            {/* Availability Status */}
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              mentor.isAvailable 
                ? 'bg-green-600 text-green-100' 
                : 'bg-red-600 text-red-100'
            }`}>
              {mentor.isAvailable ? 'Available' : 'Busy'}
            </div>
          </div>

          {/* Bio */}
          {mentor.bio && (
            <p className="text-dark-300 text-sm mb-3 line-clamp-2">
              {mentor.bio}
            </p>
          )}

          {/* Courses (formerly Skills) */}
          {mentor.profile?.courses && mentor.profile.courses.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {mentor.profile.courses.slice(0, 6).map((courseId, index) => {
                const course = courses.find(c => c.id === courseId);
                return course ? (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-primary-600/20 text-primary-300 rounded text-xs"
                  >
                    {course.name}
                  </span>
                ) : null;
              })}
              {mentor.profile.courses.length > 6 && (
                <span className="px-2 py-1 bg-dark-600 text-dark-300 rounded text-xs">
                  +{mentor.profile.courses.length - 6} more
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <Link 
              to={`/mentors/${mentor.id}`}
              className="btn-secondary text-sm"
            >
              <Eye className="w-4 h-4 mr-1" />
              View Profile
            </Link>
            
            {userData?.role === 'mentee' && mentor.isAvailable && (
              <button 
                onClick={() => requestSession(mentor.id)}
                className="btn-primary text-sm"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Request Session
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Find Your Perfect Mentor</h1>
        <p className="text-dark-400">
          Connect with experienced mentors who can help you achieve your learning goals
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-dark-800 rounded-lg p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search mentors by name or courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>
          </div>

          {/* Sort */}
          <div className="lg:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field w-full"
            >
              <option value="rating">Highest Rated</option>
              <option value="sessions">Most Sessions</option>
              <option value="newest">Newest Mentors</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Courses Filter */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-dark-600">
            <h3 className="text-white font-medium mb-3">Filter by Courses</h3>
            <div className="flex flex-wrap gap-2">
              {courses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => handleCourseToggle(course.id)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedCourses.includes(course.id)
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                  }`}
                >
                  {course.name}
                </button>
              ))}
            </div>
            
            {selectedCourses.length > 0 && (
              <div className="mt-3 flex items-center space-x-2">
                <span className="text-dark-400 text-sm">Selected:</span>
                <div className="flex flex-wrap gap-1">
                  {selectedCourses.map((courseId) => {
                    const course = courses.find(c => c.id === courseId);
                    return course ? (
                      <span
                        key={courseId}
                        className="px-2 py-1 bg-primary-600 text-white rounded text-xs flex items-center space-x-1"
                      >
                        <span>{course.name}</span>
                        <button
                          onClick={() => handleCourseToggle(courseId)}
                          className="hover:bg-primary-700 rounded"
                        >
                          ×
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
                <button
                  onClick={() => setSelectedCourses([])}
                  className="text-primary-500 hover:text-primary-400 text-sm"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-dark-400">
          {loading ? (
            'Loading mentors...'
          ) : (
            `Found ${filteredMentors.length} mentor${filteredMentors.length !== 1 ? 's' : ''}`
          )}
        </div>
        
        {selectedCourses.length > 0 && (
          <div className="text-sm text-primary-400">
            Filtered by courses
          </div>
        )}
      </div>

      {/* Mentors Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="loading-spinner"></div>
        </div>
      ) : filteredMentors.length > 0 ? (
        <div className="space-y-6">
          {filteredMentors.map(renderMentorCard)}
          
          {/* Load More */}
          {pagination.hasMore && (
            <div className="text-center py-8">
              <button 
                onClick={() => {/* Implement load more */}}
                className="btn-secondary"
              >
                Load More Mentors
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No mentors found</h3>
          <p className="text-dark-400 mb-4">
            {searchTerm || selectedCourses.length > 0 
              ? 'Try adjusting your search criteria or filters'
              : 'No mentors are currently available'
            }
          </p>
          {(searchTerm || selectedCourses.length > 0) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCourses([]);
              }}
              className="btn-primary"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Call to Action for Mentors */}
      {userData?.role === 'mentee' && (
        <div className="mt-12 bg-gradient-to-r from-primary-600 to-blue-600 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Want to become a mentor?
          </h2>
          <p className="text-primary-100 mb-6">
            Share your knowledge and help other students succeed in their learning journey.
          </p>
          <Link to="/register" className="bg-white text-primary-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition-colors">
            Apply to be a Mentor
          </Link>
        </div>
      )}
    </div>
  );
};

export default MentorListingPage;
