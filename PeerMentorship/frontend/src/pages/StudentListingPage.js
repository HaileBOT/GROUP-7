import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContextNew';
import { studentAPI } from '../services/api';
import { 
  Users, 
  Search,
  Mail,
  Calendar,
  BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';

const StudentListingPage = () => {
  const { getIdToken } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ total: 0, hasMore: false });

  useEffect(() => {
    fetchStudents();
  }, [searchTerm]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = await getIdToken();
      const params = {
        limit: 20,
        offset: 0,
        search: searchTerm
      };

      const response = await studentAPI.getAllStudents(params, token);
      setStudents(response.data.students || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Students</h1>
          <p className="text-dark-400">Browse and connect with students</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search students by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-dark-800 border border-dark-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>

        {/* Student Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="loading-spinner"></div>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-12 bg-dark-800 rounded-lg border border-dark-700">
            <Users className="w-12 h-12 text-dark-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No students found</h3>
            <p className="text-dark-400">Try adjusting your search terms</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => (
              <div key={student.id} className="bg-dark-800 rounded-lg border border-dark-700 p-6 hover:border-primary-500 transition-colors duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-dark-700 rounded-full flex items-center justify-center overflow-hidden">
                      {student.profile?.photoURL ? (
                        <img 
                          src={student.profile.photoURL} 
                          alt={`${student.first_name} ${student.last_name}`} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xl font-bold text-white">
                          {student.first_name[0]}{student.last_name[0]}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {student.first_name} {student.last_name}
                      </h3>
                      <div className="flex items-center text-dark-400 text-sm">
                        <Mail className="w-3 h-3 mr-1" />
                        {student.email}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-dark-400 flex items-center">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Sessions
                    </span>
                    <span className="text-white font-medium">{student.total_sessions || 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-dark-400 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Joined
                    </span>
                    <span className="text-white font-medium">
                      {new Date(student.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentListingPage;
