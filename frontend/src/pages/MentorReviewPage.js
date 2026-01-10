import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContextNew';
import { userAPI, ratingAPI, sessionAPI } from '../services/api';
import socketService from '../services/socket';
import { 
  Star, 
  MessageCircle, 
  Calendar, 
  Award, 
  BookOpen,
  Users,
  ArrowLeft,
  Clock,
  ThumbsUp,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

const MentorReviewPage = () => {
  const { mentorId } = useParams();
  const navigate = useNavigate();
  const { userData, getIdToken } = useAuth();
  const [mentor, setMentor] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalRatings: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [filterRating, setFilterRating] = useState('all');
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (mentorId) {
      fetchMentorData();
    }
  }, [mentorId, refreshTrigger]);

  // Auto-refresh every 30 seconds to get latest ratings
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Listen for real-time rating updates
  useEffect(() => {
    socketService.connect();
    
    const handleRatingUpdate = (data) => {
      if (data.mentorId === mentorId) {
        setStats(prev => ({
          ...prev,
          averageRating: data.newRating,
          totalRatings: data.totalRatings,
          ratingDistribution: data.ratingDistribution || prev.ratingDistribution
        }));
        
        // Refresh reviews to show new ones
        setRefreshTrigger(prev => prev + 1);
      }
    };

    socketService.onMentorRatingUpdate(handleRatingUpdate);

    return () => {
      socketService.offMentorRatingUpdate(handleRatingUpdate);
    };
  }, [mentorId]);

  const fetchMentorData = async () => {
    try {
      const token = await getIdToken();
      
      // Fetch mentor profile
      const mentorResponse = await userAPI.getUser(mentorId, token);
      setMentor(mentorResponse.data);

      // Fetch mentor stats
      const statsResponse = await ratingAPI.getMentorStats(mentorId);
      setStats(statsResponse.data);

      // Fetch mentor ratings/reviews
      const ratingsResponse = await ratingAPI.getMentorRatings(mentorId, { limit: 10 });
      setRatings(ratingsResponse.data.ratings);

    } catch (error) {
      console.error('Error fetching mentor data:', error);
      toast.error('Failed to load mentor profile');
      navigate('/mentors');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreReviews = async () => {
    setReviewsLoading(true);
    try {
      const ratingsResponse = await ratingAPI.getMentorRatings(mentorId, { 
        limit: 50,
        offset: ratings.length 
      });
      setRatings(prev => [...prev, ...ratingsResponse.data.ratings]);
      setShowAllReviews(true);
    } catch (error) {
      console.error('Error loading more reviews:', error);
      toast.error('Failed to load more reviews');
    } finally {
      setReviewsLoading(false);
    }
  };

  const requestSession = async () => {
    try {
      const token = await getIdToken();
      await sessionAPI.requestSession({
        mentorId,
        description: 'Session request from mentor profile'
      }, token);
      
      toast.success('Session request sent successfully!');
    } catch (error) {
      console.error('Error requesting session:', error);
      toast.error(error.response?.data?.error || 'Failed to request session');
    }
  };

  const filteredRatings = filterRating === 'all' 
    ? ratings 
    : ratings.filter(rating => rating.rating === parseInt(filterRating));

  const renderStarRating = (rating, size = 'w-4 h-4') => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-dark-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderRatingDistribution = () => {
    const maxCount = Math.max(...Object.values(stats.ratingDistribution));
    
    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = stats.ratingDistribution[rating] || 0;
          const percentage = stats.totalRatings > 0 ? (count / stats.totalRatings) * 100 : 0;
          
          return (
            <div key={rating} className="flex items-center space-x-3">
              <span className="text-sm text-white w-8">{rating}</span>
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <div className="flex-1 bg-dark-700 rounded-full h-2">
                <div 
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-dark-400 w-8">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Mentor Not Found</h2>
          <button onClick={() => navigate('/mentors')} className="btn-primary">
            Back to Mentors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={() => navigate('/mentors')}
          className="p-2 text-dark-400 hover:text-white transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold text-white">Mentor Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Mentor Profile Card */}
        <div className="lg:col-span-1">
          <div className="card sticky top-8">
            {/* Avatar and Basic Info */}
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                {mentor.profile?.photoURL ? (
                  <img 
                    src={mentor.profile.photoURL} 
                    alt={`${mentor.firstName} ${mentor.lastName}`} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-2xl">
                    {mentor.firstName?.[0]}{mentor.lastName?.[0]}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-white mb-1">
                {mentor.firstName} {mentor.lastName}
              </h2>
              <p className="text-primary-500 font-medium mb-3">Expert Mentor</p>
              
              {/* Rating Summary */}
              <div className="flex items-center justify-center space-x-2 mb-4">
                {renderStarRating(stats.averageRating, 'w-5 h-5')}
                <span className="text-lg font-semibold text-white">{stats.averageRating}</span>
                <span className="text-dark-400">({stats.totalRatings} reviews)</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-dark-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">150+</div>
                <div className="text-dark-400 text-sm">Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">98%</div>
                <div className="text-dark-400 text-sm">Success Rate</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={requestSession}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Request Session</span>
              </button>
              <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Schedule Later</span>
              </button>
            </div>

            {/* Quick Info */}
            <div className="mt-6 pt-6 border-t border-dark-700 space-y-3">
              <div className="flex items-center space-x-3 text-dark-300">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Usually responds in 2 hours</span>
              </div>
              <div className="flex items-center space-x-3 text-dark-300">
                <Award className="w-4 h-4" />
                <span className="text-sm">Top-rated mentor</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Section */}
          <div className="card">
            <h3 className="text-xl font-semibold text-white mb-4">About</h3>
            <p className="text-dark-300 leading-relaxed mb-6">
              {mentor.profile?.bio || 'Experienced mentor passionate about helping students achieve their academic goals. Specializing in computer science and software development with over 3 years of tutoring experience.'}
            </p>

            {/* Skills */}
            <div className="mb-6">
              <h4 className="text-lg font-medium text-white mb-3">Expertise</h4>
              <div className="flex flex-wrap gap-2">
                {mentor.profile?.skills?.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-primary-600/20 text-primary-400 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                )) || (
                  <span className="text-dark-400">No skills listed</span>
                )}
              </div>
            </div>

            {/* Courses */}
            <div>
              <h4 className="text-lg font-medium text-white mb-3">Courses</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mentor.profile?.courses?.slice(0, 4).map((courseId, index) => (
                  <div key={index} className="bg-dark-700 rounded-lg p-3 flex items-center space-x-3">
                    <BookOpen className="w-5 h-5 text-primary-500" />
                    <span className="text-white text-sm">Course {courseId}</span>
                  </div>
                )) || (
                  <span className="text-dark-400">No courses listed</span>
                )}
              </div>
            </div>
          </div>

          {/* Rating Overview */}
          <div className="card">
            <h3 className="text-xl font-semibold text-white mb-6">Rating Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Average Rating */}
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{stats.averageRating}</div>
                {renderStarRating(stats.averageRating, 'w-6 h-6')}
                <p className="text-dark-400 mt-2">{stats.totalRatings} total reviews</p>
              </div>

              {/* Rating Distribution */}
              <div>
                <h4 className="text-lg font-medium text-white mb-4">Rating Distribution</h4>
                {renderRatingDistribution()}
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Student Reviews</h3>
              
              {/* Filter */}
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="input-field text-sm"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
              {filteredRatings.length > 0 ? (
                filteredRatings.map((rating) => (
                  <div key={rating.id} className="bg-dark-700 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-white">Anonymous Student</p>
                          <p className="text-dark-400 text-sm">
                            {new Date(rating.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {renderStarRating(rating.rating)}
                    </div>
                    
                    {rating.feedback && (
                      <p className="text-dark-300 leading-relaxed mb-4">
                        {rating.feedback}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-dark-400">
                      <button className="flex items-center space-x-1 hover:text-white transition-colors">
                        <ThumbsUp className="w-4 h-4" />
                        <span>Helpful</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-dark-600 mx-auto mb-4" />
                  <p className="text-dark-400">No reviews found for the selected filter</p>
                </div>
              )}
            </div>

            {/* Load More Reviews */}
            {!showAllReviews && ratings.length >= 10 && (
              <div className="text-center mt-6">
                <button
                  onClick={loadMoreReviews}
                  disabled={reviewsLoading}
                  className="btn-secondary disabled:opacity-50"
                >
                  {reviewsLoading ? 'Loading...' : 'Load More Reviews'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorReviewPage;