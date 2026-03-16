import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { TerminalOverlay } from './Terminal';
import { Code2, Users, Calendar, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Layout() {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const location = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    }).catch(err => {
      console.error("Error fetching user in layout:", err);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '`' && e.ctrlKey) {
        e.preventDefault();
        setIsTerminalOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navbar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 border-b border-zinc-200 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold text-lg tracking-tight text-indigo-950">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <Code2 size={20} />
            </div>
            SLC Binus @Semarang
          </Link>
          
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link 
              to="/" 
              className={`flex items-center gap-2 transition-colors hover:text-indigo-600 ${location.pathname === '/' ? 'text-indigo-600' : 'text-zinc-600'}`}
            >
              <Calendar size={16} />
              Events
            </Link>
            <Link 
              to="/team" 
              className={`flex items-center gap-2 transition-colors hover:text-indigo-600 ${location.pathname === '/team' ? 'text-indigo-600' : 'text-zinc-600'}`}
            >
              <Users size={16} />
              Team
            </Link>
            
            {user && (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-zinc-200">
                <div className="relative group py-2">
                  <Link 
                    to="/admin" 
                    className={`flex items-center gap-1 transition-colors hover:text-indigo-600 ${location.pathname.startsWith('/admin') ? 'text-indigo-600' : 'text-zinc-600'}`}
                  >
                    Dashboard
                  </Link>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute top-full right-0 mt-0 w-48 bg-white border border-zinc-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top z-50 overflow-hidden">
                    <div className="py-2">
                      <Link 
                        to="/admin/team" 
                        className="block px-4 py-2 text-sm text-zinc-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      >
                        Manage Team
                      </Link>
                      <Link 
                        to="/admin" 
                        className="block px-4 py-2 text-sm text-zinc-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      >
                        Manage Content
                      </Link>
                      <Link 
                        to="/admin" 
                        className="block px-4 py-2 text-sm text-zinc-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      >
                        System Settings
                      </Link>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors ml-2"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 mt-20 py-8 text-center text-sm text-zinc-500">
        <p>© {new Date().getFullYear()} Software Laboratory Center Binus @Semarang.</p>
        <p className="mt-1 text-xs opacity-50">Press Ctrl + ` for terminal access.</p>
      </footer>

      {/* Terminal Overlay */}
      <TerminalOverlay isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} />
    </div>
  );
}
