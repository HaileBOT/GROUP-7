import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContextNew';
import { userAPI, courseAPI } from '../services/api';
import { 
  User, 
  Mail, 
  Calendar, 
  Edit3, 
  Save, 
  X,
  Plus,
  Trash2,
  Star,
  Award
} from 'lucide-react';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { userData, getIdToken, fetchUserData, currentUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    profile: {
      bio: '',
      skills: [],
      courses: [],
      availability: []
    }
  });
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    if (userData) {
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        profile: {
          bio: userData.profile?.bio || '',
          skills: userData.profile?.skills || [],
          courses: userData.profile?.courses || [],
          availability: userData.profile?.availability || []
        }
      });
    }
    fetchCourses();
  }, [userData]);

  const fetchCourses = async () => {
    try {
      const response = await courseAPI.getCourses();
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('profile.')) {
      const profileField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          [profileField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.profile.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          skills: [...prev.profile.skills, newSkill.trim()]
        }
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        skills: prev.profile.skills.filter(skill => skill !== skillToRemove)
      }
    }));
  };

  const toggleCourse = (courseId) => {
    setFormData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        courses: prev.profile.courses.includes(courseId)
          ? prev.profile.courses.filter(id => id !== courseId)
          : [...prev.profile.courses, courseId]
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = await getIdToken();
      await userAPI.updateUser(userData.uid, formData, token);
      
      // Refresh user data
      await fetchUserData(currentUser);
      
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      profile: {
        bio: userData.profile?.bio || '',
        skills: userData.profile?.skills || [],
        courses: userData.profile?.courses || [],
        availability: userData.profile?.availability || []
      }
    });
    setEditing(false);
  };

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Profile</h1>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save'}</span>
            </button>
            <button
              onClick={handleCancel}
              className="btn-secondary flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="card text-center">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">
                {userData.firstName?.[0]}{userData.lastName?.[0]}
              </span>
            </div>

            {/* Basic Info */}
            <h2 className="text-xl font-bold text-white mb-1">
              {userData.firstName} {userData.lastName}
            </h2>
            <p className="text-primary-500 font-medium mb-2 capitalize">
              {userData.role}
            </p>
            <div className="flex items-center justify-center space-x-1 text-dark-400 text-sm mb-4">
              <Mail className="w-4 h-4" />
              <span>{userData.email}</span>
            </div>
            <div className="flex items-center justify-center space-x-1 text-dark-400 text-sm mb-6">
              <Calendar className="w-4 h-4" />
              <span>Joined {new Date(userData.createdAt?.toDate?.() || userData.createdAt).toLocaleDateString()}</span>
            </div>

            {/* Stats for Mentors */}
            {userData.role === 'mentor' && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dark-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">4.8</div>
                  <div className="text-dark-400 text-sm">Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">24</div>
                  <div className="text-dark-400 text-sm">Sessions</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  First Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="input-field w-full"
                  />
                ) : (
                  <p className="text-dark-300">{userData.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Last Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="input-field w-full"
                  />
                ) : (
                  <p className="text-dark-300">{userData.lastName}</p>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">About</h3>
            {editing ? (
              <textarea
                name="profile.bio"
                value={formData.profile.bio}
                onChange={handleInputChange}
                rows={4}
                className="input-field w-full"
                placeholder="Tell others about yourself, your experience, and what you can help with..."
              />
            ) : (
              <p className="text-dark-300">
                {userData.profile?.bio || 'No bio provided yet.'}
              </p>
            )}
          </div>

          {/* Skills */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Skills</h3>
            {editing ? (
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    className="input-field flex-1"
                    placeholder="Add a skill..."
                  />
                  <button
                    onClick={addSkill}
                    className="btn-primary px-4"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-primary-600/20 text-primary-400 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                    >
                      <span>{skill}</span>
                      <button
                        onClick={() => removeSkill(skill)}
                        className="text-primary-400 hover:text-primary-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {userData.profile?.skills?.length > 0 ? (
                  userData.profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-primary-600/20 text-primary-400 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-dark-400">No skills added yet.</p>
                )}
              </div>
            )}
          </div>

          {/* Courses */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">
              {userData.role === 'mentor' ? 'Courses I Mentor' : 'Courses I\'m Learning'}
            </h3>
            {editing ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {courses.map((course) => (
                  <label
                    key={course.id}
                    className="flex items-center space-x-3 p-2 hover:bg-dark-700 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.profile.courses.includes(course.id)}
                      onChange={() => toggleCourse(course.id)}
                      className="rounded border-dark-600 bg-dark-800 text-primary-600 focus:ring-primary-500"
                    />
                    <div>
                      <p className="text-white text-sm">{course.name}</p>
                      <p className="text-dark-400 text-xs">{course.department}</p>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {userData.profile?.courses?.length > 0 ? (
                  userData.profile.courses.map((courseId) => {
                    const course = courses.find(c => c.id === courseId);
                    return course ? (
                      <div key={courseId} className="bg-dark-700 rounded-lg p-3">
                        <p className="text-white font-medium">{course.name}</p>
                        <p className="text-dark-400 text-sm">{course.department}</p>
                      </div>
                    ) : null;
                  })
                ) : (
                  <p className="text-dark-400">No courses selected yet.</p>
                )}
              </div>
            )}
          </div>

          {/* Mentor Status */}
          {userData.role === 'mentor' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">Mentor Status</h3>
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${userData.approved ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="text-white">
                  {userData.approved ? 'Approved Mentor' : 'Pending Approval'}
                </span>
              </div>
              {!userData.approved && (
                <p className="text-dark-400 text-sm mt-2">
                  Your mentor application is being reviewed. You'll be notified once approved.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;