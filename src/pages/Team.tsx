import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Github, Linkedin, Mail, Instagram } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Team() {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        // Fetch users who have a role assigned in user_roles
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            *,
            user_roles!inner(role_id)
          `);
        
        if (error) {
          console.error("Error fetching team:", error);
        }
        
        if (data) {
          setTeam(data);
        }
      } catch (err) {
        console.error("Unexpected error fetching team:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  return (
    <div className="space-y-12">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold tracking-tight mb-4 text-zinc-900"
        >
          Meet Our Team
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-zinc-600"
        >
          The dedicated lab assistants behind Software Laboratory Center Binus @Semarang.
        </motion.p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group relative bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="relative mb-6 overflow-hidden rounded-2xl aspect-square bg-zinc-100">
                <img 
                  src={member.image_url ? `${member.image_url}?t=${Date.now()}` : `https://picsum.photos/seed/${member.full_name}/400/400`} 
                  alt={member.full_name} 
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 gap-4">
                  {member.github_url && (
                    <a href={member.github_url} target="_blank" rel="noopener noreferrer" className="text-white hover:text-indigo-300 transition-colors">
                      <Github size={20} />
                    </a>
                  )}
                  {member.linkedin_url && (
                    <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-white hover:text-indigo-300 transition-colors">
                      <Linkedin size={20} />
                    </a>
                  )}
                  {member.ig_url && (
                    <a href={member.ig_url} target="_blank" rel="noopener noreferrer" className="text-white hover:text-indigo-300 transition-colors">
                      <Instagram size={20} />
                    </a>
                  )}
                  {member.email && (
                    <a href={`mailto:${member.email}`} className="text-white hover:text-indigo-300 transition-colors">
                      <Mail size={20} />
                    </a>
                  )}
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-zinc-900 mb-0">
                  {member.full_name}
                </h3>
                {member.initials && (
                  <p className="text-sm font-medium text-zinc-500 mb-2">
                    {member.is_active === false ? `ex. ${member.initials}` : member.initials}
                  </p>
                )}
                <p className="text-sm font-medium text-indigo-600 mb-4">{member.role_title || 'Lab Assistant'}</p>
                
                <p className="text-sm text-zinc-600 leading-relaxed">{member.bio || 'No bio provided.'}</p>
              </div>
            </motion.div>
          ))}
          
          {team.length === 0 && (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-zinc-200 rounded-2xl">
              <p className="text-zinc-500">No team members found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
