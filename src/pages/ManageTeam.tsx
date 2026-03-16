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
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
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
        
        // Fetch role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role_id')
          .eq('user_id', user.id);
          
        if (roleError) {
          console.error("Error fetching roles:", roleError);
        }

        let role = 'user';
        if (roleData && roleData.length > 0) {
          const roleIds = roleData.map(r => r.role_id);
          if (roleIds.includes(1)) {
            role = 'admin';
          } else if (roleIds.includes(2)) {
            role = 'assistant';
          }
        }
        
        setUserRole(role);

        if (role !== 'admin' && role !== 'assistant') {
          navigate('/admin');
          return;
        }

        // Fetch team profiles
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*');
          
        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
        }

        if (profiles) {
          setTeam(profiles);
        }
      } catch (err) {
        console.error("Unexpected error during init:", err);
      } finally {
        setLoading(false);
      }
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
    setUploading(true);
    const formData = new FormData(e.currentTarget);
    
    let image_url = editingMember?.image_url;
    const imageFile = formData.get('profile_image') as File;

    try {
      if (imageFile && imageFile.size > 0) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${editingMember.id}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('profiles')
          .upload(fileName, imageFile, { upsert: true });

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          alert(`Failed to upload image: ${uploadError.message}. Please ensure the "profiles" storage bucket exists.`);
        } else {
          const { data: publicUrlData } = supabase.storage
            .from('profiles')
            .getPublicUrl(fileName);
          image_url = publicUrlData.publicUrl;
        }
      }

      const updates = {
        full_name: formData.get('full_name') as string,
        initials: formData.get('initials') as string,
        is_active: formData.get('is_active') === 'true',
        bio: formData.get('bio') as string,
        github_url: formData.get('github_url') as string,
        ig_url: formData.get('ig_url') as string,
        linkedin_url: formData.get('linkedin_url') as string,
        image_url: image_url || `https://picsum.photos/seed/${formData.get('full_name')}/400/400`,
      };

      console.log("Attempting to save updates:", updates);

      if (editingMember) {
        // Use .select() to ensure the row was actually updated (catches RLS silent failures)
        const { data: updatedData, error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', editingMember.id)
          .select();
          
        if (error) {
          console.error("Failed to update profile", error);
          alert(`Failed to update profile: ${error.message}. Did you run the SQL to add the new columns?`);
        } else if (!updatedData || updatedData.length === 0) {
          console.error("Update blocked by RLS or row not found.");
          alert("Update failed. You might not have permission to edit this profile, or the database policy blocked it.");
        } else {
          console.log("Successfully updated profile:", updatedData[0]);
          setTeam(team.map(m => m.id === editingMember.id ? { ...m, ...updatedData[0] } : m));
          setIsModalOpen(false);
          setEditingMember(null);
        }
      }
    } catch (err: any) {
      console.error("Unexpected error during save:", err);
      alert(`An unexpected error occurred: ${err.message || 'Failed to fetch'}. Please check your connection or database schema.`);
    } finally {
      setUploading(false);
    }
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

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayedTeam.map((member, i) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col"
          >
            <div className="absolute top-0 left-0 w-full h-32 bg-indigo-50/50 group-hover:bg-indigo-100/50 transition-colors" />
            
            <div className="absolute top-4 right-4 z-20 flex gap-2">
              <button 
                onClick={() => openEditModal(member)}
                className="p-2 bg-white/80 backdrop-blur-sm text-zinc-600 hover:text-indigo-600 hover:bg-white rounded-full shadow-sm transition-all"
                title="Edit Profile"
              >
                <Edit2 size={16} />
              </button>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg mb-6 bg-zinc-100">
                <img 
                  src={member.image_url ? `${member.image_url}?t=${Date.now()}` : `https://picsum.photos/seed/${member.full_name}/400/400`} 
                  alt={member.full_name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <div className="text-center flex-1 flex flex-col">
              <h3 className="text-xl font-semibold text-zinc-900 mb-0">
                {member.full_name}
              </h3>
              {member.initials && (
                <p className="text-sm font-medium text-zinc-500 mb-2">
                  {member.is_active === false ? `ex. ${member.initials}` : member.initials}
                </p>
              )}
              <p className="text-sm font-medium text-indigo-600 mb-4">{member.role_title || 'Lab Assistant'}</p>
              
              <p className="text-sm text-zinc-600 leading-relaxed line-clamp-3">{member.bio || 'No bio provided.'}</p>
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
              
              <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Full Name</label>
                    <input 
                      name="full_name"
                      type="text" 
                      defaultValue={editingMember?.full_name}
                      required
                      className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Initials</label>
                    <input 
                      name="initials"
                      type="text" 
                      defaultValue={editingMember?.initials}
                      placeholder="e.g. BS"
                      className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Status</label>
                  <select 
                    name="is_active"
                    defaultValue={editingMember?.is_active === false ? 'false' : 'true'}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="true">Active</option>
                    <option value="false">Ex (Alumni)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Profile Image</label>
                  <input 
                    name="profile_image"
                    type="file" 
                    accept="image/*"
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  <p className="text-xs text-zinc-500 mt-1">Leave empty to keep current image.</p>
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

                <div className="space-y-3 pt-2 border-t border-zinc-100">
                  <h3 className="text-sm font-semibold text-zinc-900">Social Links</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">GitHub URL</label>
                    <input 
                      name="github_url"
                      type="url" 
                      defaultValue={editingMember?.github_url}
                      placeholder="https://github.com/username"
                      className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Instagram URL</label>
                    <input 
                      name="ig_url"
                      type="url" 
                      defaultValue={editingMember?.ig_url}
                      placeholder="https://instagram.com/username"
                      className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">LinkedIn URL</label>
                    <input 
                      name="linkedin_url"
                      type="url" 
                      defaultValue={editingMember?.linkedin_url}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={uploading}
                    className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={uploading}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {uploading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    {uploading ? 'Saving...' : 'Save Changes'}
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
