import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContextNew';
import { questionAPI, matchingAPI, courseAPI } from '../services/api';
import { 
  HelpCircle, 
  Tag, 
  BookOpen, 
  Users, 
  Star,
  MessageCircle,
  ArrowRight,
  Plus,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const AskQuestionPage = () => {
  const { userData, getIdToken } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    tags: [],
    priority: 'medium'
  });
  const [courses, setCourses] = useState([]);
  const [suggestedMentors, setSuggestedMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMentors, setShowMentors] = useState(false);
  const [newTag, setNewTag] = useState('');

  // Common tags for suggestions
  const commonTags = [
    'Calculus', 'Linear Algebra', 'Differential Equations', 'Modeling',
    'Mechanics', 'Thermodynamics', 'Electromagnetism', 'Quantum Physics',
    'Probability', 'Data Analysis', 'Regression', 'Hypothesis Testing',
    'Microeconomics', 'Macroeconomics', 'Econometrics', 'Finance',
    'Propositional Logic', 'Critical Thinking', 'Reasoning', 'Arguments',
    'Cognitive', 'Behavioral', 'Clinical', 'Developmental'
  ];

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (formData.tags.length > 0) {
      findMatchingMentors();
    } else {
      setSuggestedMentors([]);
      setShowMentors(false);
    }
  }, [formData.tags]);

  const fetchCourses = async () => {
    try {
      const response = await courseAPI.getCourses();
      setCourses(response.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const findMatchingMentors = async () => {
    try {
      const token = await getIdToken();
      if (!token || formData.tags.length === 0) return;

      const response = await matchingAPI.findMentors(formData.tags, formData.courseId, token);
      setSuggestedMentors(response.data.mentors || []);
      setShowMentors(true);
    } catch (error) {
      console.error('Error finding mentors:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const addTag = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag]
      });
    }
    setNewTag('');
  };

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = await getIdToken();
      if (!token) {
        toast.error('Please log in to ask a question');
        return;
      }

      await questionAPI.createQuestion(formData, token);
      toast.success('Question posted successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error posting question:', error);
      toast.error('Failed to post question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Ask a Question</h1>
        <p className="text-dark-400">
          Get help from our community of mentors and peers
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Question Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="card space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
                Question Title *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="What's your question about?"
              />
            </div>

            {/* Course */}
            <div>
              <label htmlFor="courseId" className="block text-sm font-medium text-white mb-2">
                Related Course
              </label>
              <select
                id="courseId"
                name="courseId"
                value={formData.courseId}
                onChange={handleChange}
                className="input-field w-full"
              >
                <option value="">Select a course (optional)</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name} - {course.department}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
                Question Details *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={6}
                value={formData.description}
                onChange={handleChange}
                className="textarea-field w-full"
                placeholder="Provide more details about your question. Include what you've tried, error messages, or specific areas where you need help."
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Tags *
              </label>
              <p className="text-dark-400 text-sm mb-3">
                Add tags to help mentors find your question. This will also help us match you with the right mentors.
              </p>
              
              {/* Current Tags */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary-600 text-white rounded-full text-sm flex items-center space-x-1"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:bg-primary-700 rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Add New Tag */}
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(newTag))}
                  className="input-field flex-1"
                  placeholder="Add a tag..."
                />
                <button
                  type="button"
                  onClick={() => addTag(newTag)}
                  className="btn-secondary"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Suggested Tags */}
              <div>
                <p className="text-dark-400 text-sm mb-2">Suggested tags:</p>
                <div className="flex flex-wrap gap-2">
                  {commonTags
                    .filter(tag => !formData.tags.includes(tag))
                    .slice(0, 10)
                    .map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => addTag(tag)}
                        className="px-2 py-1 bg-dark-700 text-dark-300 hover:bg-dark-600 rounded text-sm transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-white mb-2">
                Priority Level
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="input-field w-full"
              >
                <option value="low">Low - General question</option>
                <option value="medium">Medium - Need help soon</option>
                <option value="high">High - Urgent help needed</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || formData.tags.length === 0}
              className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="loading-spinner"></div>
              ) : (
                <>
                  <HelpCircle className="w-5 h-5 mr-2" />
                  Post Question
                </>
              )}
            </button>
          </form>
        </div>

        {/* Matching Mentors Sidebar */}
        <div className="lg:col-span-1">
          <div className="card sticky top-8">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Matching Mentors
            </h3>
            
            {formData.tags.length === 0 ? (
              <div className="text-center py-8">
                <Tag className="w-12 h-12 text-dark-600 mx-auto mb-4" />
                <p className="text-dark-400 text-sm">
                  Add tags to see mentors who can help with your question
                </p>
              </div>
            ) : suggestedMentors.length === 0 ? (
              <div className="text-center py-8">
                <div className="loading-spinner mb-4"></div>
                <p className="text-dark-400 text-sm">Finding matching mentors...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-dark-400 text-sm mb-4">
                  Found {suggestedMentors.length} mentor{suggestedMentors.length !== 1 ? 's' : ''} who can help:
                </p>
                
                {suggestedMentors.slice(0, 3).map((mentor) => (
                  <div key={mentor.id} className="bg-dark-700 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden">
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
                      <div className="flex-1">
                        <h4 className="font-medium text-white text-sm">
                          {mentor.first_name} {mentor.last_name}
                        </h4>
                        <div className="flex items-center space-x-2 text-xs text-dark-400">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span>{mentor.averageRating.toFixed(1)}</span>
                          <span>•</span>
                          <span>{mentor.matchScore}% match</span>
                        </div>
                      </div>
                    </div>
                    
                    {mentor.skillMatches > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {formData.tags
                          .filter(tag => mentor.skills?.includes(tag))
                          .slice(0, 3)
                          .map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-primary-600/20 text-primary-300 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
                
                {suggestedMentors.length > 3 && (
                  <p className="text-center text-dark-400 text-sm">
                    +{suggestedMentors.length - 3} more mentors available
                  </p>
                )}
                
                <div className="pt-4 border-t border-dark-600">
                  <p className="text-dark-400 text-sm mb-3">
                    After posting your question, these mentors will be notified and can offer help.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AskQuestionPage;