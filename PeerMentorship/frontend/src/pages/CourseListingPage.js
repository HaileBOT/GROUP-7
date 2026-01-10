import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseAPI, userAPI } from '../services/api';
import { 
  Search, 
  BookOpen, 
  Users, 
  Star,
  ArrowRight,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

const CourseListingPage = () => {
  const [courses, setCourses] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesResponse, mentorsResponse] = await Promise.all([
        courseAPI.getCourses(),
        userAPI.getMentors()
      ]);
      
      setCourses(coursesResponse.data);
      setMentors(mentorsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  // Get unique departments
  const departments = [...new Set(courses.map(course => course.department))].filter(Boolean);

  // Filter courses based on search and department
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDepartment = !selectedDepartment || course.department === selectedDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  // Get mentors for a specific course
  const getMentorsForCourse = (courseId) => {
    return mentors.filter(mentor => 
      mentor.profile?.courses?.includes(courseId)
    ).slice(0, 3); // Show only first 3 mentors
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Explore Courses</h1>
        <p className="text-dark-400">Discover subjects and connect with expert mentors</p>
      </div>

      {/* Search and Filters */}
      <div className="card mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search courses, topics, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="input-field w-full"
          >
            <option value="">All Departments</option>
            {departments.map(department => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCourses.map((course) => {
          const courseMentors = getMentorsForCourse(course.id);
          
          return (
            <div key={course.id} className="card hover:bg-dark-700 transition-colors duration-200">
              {/* Course Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="bg-primary-600 p-2 rounded-lg">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{course.name}</h3>
                      <p className="text-dark-400 text-sm">{course.department}</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-1 mb-1">
                    <Users className="w-4 h-4 text-dark-400" />
                    <span className="text-sm text-dark-400">{courseMentors.length} mentors</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-white">4.7</span>
                  </div>
                </div>
              </div>

              {/* Course Description */}
              <p className="text-dark-300 text-sm mb-4 line-clamp-2">
                {course.description || 'Comprehensive course covering essential topics and practical applications.'}
              </p>

              {/* Tags */}
              {course.tags && course.tags.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {course.tags.slice(0, 4).map((tag, index) => (
                      <span
                        key={index}
                        className="bg-dark-600 text-dark-300 px-2 py-1 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                    {course.tags.length > 4 && (
                      <span className="text-dark-400 text-xs">
                        +{course.tags.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Available Mentors */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-white mb-3">Available Mentors</h4>
                {courseMentors.length > 0 ? (
                  <div className="space-y-2">
                    {courseMentors.map((mentor) => (
                      <div key={mentor.id} className="flex items-center space-x-3 bg-dark-600 rounded-lg p-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center overflow-hidden">
                          {mentor.profile?.photoURL ? (
                            <img 
                              src={mentor.profile.photoURL} 
                              alt={`${mentor.firstName} ${mentor.lastName}`} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-medium text-sm">
                              {mentor.firstName?.[0]}{mentor.lastName?.[0]}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">
                            {mentor.firstName} {mentor.lastName}
                          </p>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-dark-300">4.8</span>
                            </div>
                            <span className="text-xs text-dark-400">•</span>
                            <span className="text-xs text-dark-400">25 sessions</span>
                          </div>
                        </div>
                        <button className="text-primary-500 hover:text-primary-400 text-xs">
                          Connect
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 bg-dark-600 rounded-lg">
                    <Users className="w-8 h-8 text-dark-500 mx-auto mb-2" />
                    <p className="text-dark-400 text-sm">No mentors available yet</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <Link
                  to={`/mentors?course=${course.id}`}
                  className="flex-1 btn-primary text-sm py-2 flex items-center justify-center"
                >
                  Find Mentors
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
                <button className="btn-secondary text-sm py-2 px-4">
                  Learn More
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No courses found</h3>
          <p className="text-dark-400 mb-4">
            Try adjusting your search terms or filters
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedDepartment('');
            }}
            className="btn-primary"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Course Categories */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Popular Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {departments.map((department) => {
            const departmentCourses = courses.filter(course => course.department === department);
            return (
              <button
                key={department}
                onClick={() => setSelectedDepartment(department)}
                className="card text-center hover:bg-dark-700 transition-colors duration-200 p-4"
              >
                <div className="bg-primary-600 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-medium text-white text-sm mb-1">{department}</h3>
                <p className="text-dark-400 text-xs">{departmentCourses.length} courses</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CourseListingPage;