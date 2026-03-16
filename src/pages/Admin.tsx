import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Users, Settings, FileText, Lock } from 'lucide-react';

export function Admin() {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('user');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error("Auth error:", authError);
        }

        if (!user) {
          navigate('/');
          return;
        }
        
        setUser(user);

        // Ambil semua role yang dimiliki user ini (bisa lebih dari satu)
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role_id')
          .eq('user_id', user.id);

        // Tampilkan error di console browser jika ada masalah koneksi/keamanan
        if (roleError) {
          console.error("Gagal mengambil data role:", roleError.message);
        }

        console.log(roleData);

        // Cek apakah data role ditemukan dan tidak kosong
        if (roleData && roleData.length > 0) {
          // Ubah format [{role_id: 1}, {role_id: 2}] menjadi array angka sederhana [1, 2]
          const roleIds = roleData.map(r => r.role_id);

          // Prioritaskan pengecekan Admin terlebih dahulu
          if (roleIds.includes(1)) {
            setUserRole('admin');
          } else if (roleIds.includes(2)) {
            setUserRole('assistant');
          } else {
            setUserRole('user');
          }
        } else {
          // Jika tidak ada data di user_roles, jadikan user biasa
          console.log("GAADA" + user.id);
          setUserRole('user');
        }
      } catch (err) {
        console.error("Unexpected error during initAuth:", err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [navigate]);

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  if (!user) return null;

  const isAdmin = userRole === 'admin';
  const isAssistant = userRole === 'assistant';

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-zinc-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Dashboard</h1>
          <p className="text-zinc-600">Welcome back, {user.email}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-200">
          <ShieldAlert size={16} />
          Role: {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {(isAdmin || isAssistant) && (
          <motion.div 
            onClick={() => navigate('/admin/team')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
              <Users size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">{isAdmin ? 'Manage Team' : 'My Profile'}</h3>
            <p className="text-sm text-zinc-600">
              {isAdmin ? 'Edit lab assistant profiles and roles.' : 'Update your own lab assistant profile.'}
            </p>
          </motion.div>
        )}

        {(isAdmin || isAssistant) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center mb-4">
              <FileText size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Manage Content</h3>
            <p className="text-sm text-zinc-600">Update events, announcements, and schedules.</p>
          </motion.div>
        )}

        {isAdmin && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="w-12 h-12 bg-zinc-100 text-zinc-600 rounded-xl flex items-center justify-center mb-4">
              <Settings size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">System Settings</h3>
            <p className="text-sm text-zinc-600">Configure portal settings and access control.</p>
          </motion.div>
        )}

        {!isAdmin && !isAssistant && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-full p-8 text-center bg-zinc-50 rounded-2xl border border-zinc-200 flex flex-col items-center justify-center"
          >
            <div className="w-16 h-16 bg-zinc-200 text-zinc-500 rounded-full flex items-center justify-center mb-4">
              <Lock size={32} />
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 mb-2">Standard User Access</h3>
            <p className="text-zinc-600 max-w-md mx-auto">
              You have read-only access to the portal. You can view upcoming events and team members from the public pages.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
