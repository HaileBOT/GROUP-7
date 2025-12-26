import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { GraduationCap, Loader2 } from 'lucide-react';

export default function Register({ onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'Mentee',
    department: 'Software Engineering'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 2. Create Firestore Document (SDS User Class)
      // Path follows RULE 1: /artifacts/{appId}/users/{userId}/{collectionName}
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'peer-mentorship';
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile'), {
        userId: user.uid,
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role,
        department: formData.department,
        isAvailable: false,
        subjects: [],
        createdAt: new Date().toISOString()
      });

      console.log("User registered successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="flex justify-center mb-6 text-indigo-600">
          <GraduationCap size={56} strokeWidth={2.5} />
        </div>
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Create Account</h2>
        <p className="text-slate-400 text-center text-sm mb-8 font-medium tracking-tight">Chronus Peer Mentorship Platform</p>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 text-xs font-bold rounded-xl mb-6 border border-red-100 uppercase tracking-wider">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Full Name</label>
            <input 
              type="text" placeholder="Abebe Kebede" required
              className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Email Address</label>
            <input 
              type="email" placeholder="student@university.edu" required
              className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Password</label>
            <input 
              type="password" placeholder="••••••••" required
              className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          
          <div className="space-y-1 pt-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Select Your Primary Role</label>
            <div className="flex gap-2">
              {['Mentee', 'Mentor'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFormData({...formData, role: r})}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${
                    formData.role === r 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <button 
            disabled={isLoading}
            className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Join the Platform"}
          </button>
        </form>
        
        <p className="mt-8 text-center text-sm text-slate-400">
          Already have an account? <span className="text-indigo-600 font-bold cursor-pointer hover:underline">Sign In</span>
        </p>
      </div>
    </div>
  );
}