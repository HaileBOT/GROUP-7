import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContextNew';
import { adminAPI } from '../services/api';
import Layout from '../components/Layout';
import { Users, BookOpen, Clock, CheckCircle, XCircle } from 'lucide-react';

const AdminDashboardPage = () => {
  const { user, getIdToken } = useAuth();
  const [stats, setStats] = useState({
    mentors: 0,
    mentees: 0,
    pendingMentors: 0,
    sessions: 0
  });
  const [pendingMentors, setPendingMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getIdToken();
        const [statsRes, mentorsRes] = await Promise.all([
          adminAPI.getStats(token),
          adminAPI.getPendingMentors(token)
        ]);
        setStats(statsRes.data);
        setPendingMentors(mentorsRes.data);
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getIdToken]);

  const handleApproval = async (mentorId, approved) => {
    try {
      const token = await getIdToken();
      await adminAPI.approveMentor(mentorId, approved, token);
      
      // Refresh list
      const mentorsRes = await adminAPI.getPendingMentors(token);
      setPendingMentors(mentorsRes.data);
      
      // Refresh stats
      const statsRes = await adminAPI.getStats(token);
      setStats(statsRes.data);
      
    } catch (err) {
      console.error('Error updating mentor status:', err);
      alert('Failed to update mentor status');
    }
  };

  if (loading) return <Layout><div className="flex justify-center items-center h-screen"><div className="loading-spinner"></div></div></Layout>;
  if (error) return <Layout><div className="text-red-500 text-center mt-10">{error}</div></Layout>;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary-600 to-blue-600 rounded-2xl p-8 mb-8 text-white shadow-lg">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-primary-100">Manage mentors, users, and platform activity.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card bg-dark-800 p-6 rounded-lg shadow-md border border-dark-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-dark-400 text-sm font-medium">Total Mentors</h3>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.mentors}</p>
          </div>
          <div className="card bg-dark-800 p-6 rounded-lg shadow-md border border-dark-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-dark-400 text-sm font-medium">Total Mentees</h3>
              <Users className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.mentees}</p>
          </div>
          <div className="card bg-dark-800 p-6 rounded-lg shadow-md border border-dark-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-dark-400 text-sm font-medium">Pending Approvals</h3>
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.pendingMentors}</p>
          </div>
          <div className="card bg-dark-800 p-6 rounded-lg shadow-md border border-dark-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-dark-400 text-sm font-medium">Total Sessions</h3>
              <BookOpen className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.sessions}</p>
          </div>
        </div>

        {/* Pending Mentors Table */}
        <div className="bg-dark-800 rounded-lg shadow-md overflow-hidden border border-dark-700">
          <div className="px-6 py-4 border-b border-dark-700">
            <h2 className="text-xl font-semibold text-white">Pending Mentor Applications</h2>
          </div>
          
          {pendingMentors.length === 0 ? (
            <div className="p-6 text-center text-dark-400">
              No pending applications
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-dark-700">
                <thead className="bg-dark-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">Applied Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-dark-800 divide-y divide-dark-700">
                  {pendingMentors.map((mentor) => (
                    <tr key={mentor.id} className="hover:bg-dark-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {mentor.first_name} {mentor.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-dark-300">{mentor.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-dark-300">
                          {new Date(mentor.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleApproval(mentor.id, true)}
                            className="flex items-center text-green-500 hover:text-green-400 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-5 h-5 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleApproval(mentor.id, false)}
                            className="flex items-center text-red-500 hover:text-red-400 transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-5 h-5 mr-1" />
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboardPage;
