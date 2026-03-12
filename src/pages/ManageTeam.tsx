import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, X, Save, ArrowLeft, ShieldAlert } from 'lucide-react';

export function ManageTeam() {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('user');
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }
      
      setUser(user);
      
      // Fetch role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', user.id)
        .maybeSingle();
        
      const role = roleData ? (roleData.role_id === 1 ? 'admin' : 'assistant') : 'user';
      setUserRole(role);

      if (role !== 'admin' && role !== 'assistant') {
        navigate('/admin');
        return;
      }

      // Fetch team profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*');
        
      if (profiles) {
        setTeam(profiles);
      }
      
      setLoading(false);
    };
    init();
  }, [navigate]);

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  if (!user) return null;

  const isAdmin = userRole === 'admin';

  // Assistants can only see/edit their own profile
  const displayedTeam = isAdmin ? team : team.filter(m => m.id === user.id);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updates = {
      full_name: formData.get('full_name') as string,
      role_title: formData.get('role_title') as string,
      specialty: formData.get('specialty') as string,
      bio: formData.get('bio') as string,
      image_url: formData.get('image_url') as string || `https://picsum.photos/seed/${formData.get('full_name')}/400/400`,
    };

    if (editingMember) {
      const { error } = await supabase.from('profiles').update(updates).eq('id', editingMember.id);
      if (!error) {
        setTeam(team.map(m => m.id === editingMember.id ? { ...m, ...updates } : m));
      } else {
        console.error("Failed to update profile", error);
        alert("Failed to update profile. Check console for details.");
      }
    }
    setIsModalOpen(false);
    setEditingMember(null);
  };

  const openEditModal = (member: any) => {
    setEditingMember(member);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between border-b border-zinc-200 pb-6">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-zinc-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 mb-1">
              {isAdmin ? 'Manage Team' : 'My Profile'}
            </h1>
            <p className="text-zinc-600">
              {isAdmin ? 'Edit lab assistant profiles.' : 'Update your public lab assistant profile.'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedTeam.map((member, i) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col"
          >
            <div className="aspect-video w-full bg-zinc-100 relative">
              <img 
                src={member.image_url || `https://picsum.photos/seed/${member.full_name}/400/400`} 
                alt={member.full_name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <button 
                  onClick={() => openEditModal(member)}
                  className="p-2 bg-white/90 backdrop-blur text-zinc-700 hover:text-indigo-600 rounded-lg shadow-sm transition-colors"
                  title="Edit Profile"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-lg font-semibold text-zinc-900">{member.full_name}</h3>
              <p className="text-sm font-medium text-indigo-600 mb-1">{member.role_title || 'Lab Assistant'}</p>
              <p className="text-xs text-zinc-500 mb-3">{member.specialty || 'No specialty set'}</p>
              <p className="text-sm text-zinc-600 line-clamp-3">{member.bio || 'No bio provided.'}</p>
            </div>
          </motion.div>
        ))}

        {displayedTeam.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-zinc-200 rounded-2xl">
            <p className="text-zinc-500">No team members found.</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
                <h2 className="text-lg font-semibold text-zinc-900">
                  Edit Profile
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Full Name</label>
                  <input 
                    name="full_name"
                    type="text" 
                    defaultValue={editingMember?.full_name}
                    required
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Role Title</label>
                    <input 
                      name="role_title"
                      type="text" 
                      defaultValue={editingMember?.role_title}
                      placeholder="e.g. Lead Lab Assistant"
                      className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Specialty</label>
                    <input 
                      name="specialty"
                      type="text" 
                      defaultValue={editingMember?.specialty}
                      placeholder="e.g. Web Dev"
                      className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Image URL</label>
                  <input 
                    name="image_url"
                    type="url" 
                    defaultValue={editingMember?.image_url}
                    placeholder="Leave empty for random avatar"
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Bio</label>
                  <textarea 
                    name="bio"
                    rows={3}
                    defaultValue={editingMember?.bio}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                  ></textarea>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    <Save size={16} />
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
