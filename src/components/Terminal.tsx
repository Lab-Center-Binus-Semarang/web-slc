import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal as TerminalIcon, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface Command {
  input: string;
  output: React.ReactNode;
}

const RIDDLE = "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?";
const RIDDLE_ANSWER = "echo";

export function TerminalOverlay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [history, setHistory] = useState<Command[]>([
    { input: '', output: 'Welcome to SLC Secure Terminal. Type "help" for a list of commands.' }
  ]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'normal' | 'riddle' | 'login_email' | 'login_password'>('normal');
  const [email, setEmail] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = async (cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd && mode === 'normal') return;

    const newHistory = [...history, { input: mode === 'login_password' ? '*'.repeat(cmd.length) : cmd, output: '' }];
    
    if (mode === 'riddle') {
      if (trimmedCmd.toLowerCase() === RIDDLE_ANSWER) {
        newHistory[newHistory.length - 1].output = 'Access granted. Proceeding to authentication.\\nEnter your email:';
        setMode('login_email');
      } else {
        newHistory[newHistory.length - 1].output = 'Incorrect. Access denied. Returning to normal mode.';
        setMode('normal');
      }
      setHistory(newHistory);
      setInput('');
      return;
    }

    if (mode === 'login_email') {
      setEmail(trimmedCmd);
      newHistory[newHistory.length - 1].output = 'Enter your password:';
      setMode('login_password');
      setHistory(newHistory);
      setInput('');
      return;
    }

    if (mode === 'login_password') {
      newHistory[newHistory.length - 1].output = 'Authenticating...';
      setHistory(newHistory);
      setInput('');
      
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: cmd,
        });

        if (error) throw error;

        setHistory(prev => [...prev, { input: '', output: 'Authentication successful. Welcome, Agent.' }]);
        setMode('normal');
        setTimeout(() => {
          onClose();
          navigate('/admin');
        }, 1500);
      } catch (err: any) {
        setHistory(prev => [...prev, { input: '', output: `Authentication failed: ${err.message}` }]);
        setMode('normal');
      }
      return;
    }

    // Normal mode commands
    let output: React.ReactNode = '';
    const args = trimmedCmd.split(' ');
    const mainCmd = args[0].toLowerCase();

    switch (mainCmd) {
      case 'help':
        output = (
          <div className="flex flex-col gap-1">
            <span>Available commands:</span>
            <span>  help   - Show this message</span>
            <span>  clear  - Clear terminal output</span>
            <span>  login  - Initiate secure login sequence</span>
            <span>  exit   - Close terminal</span>
            <span>  whoami - Display current user info</span>
          </div>
        );
        break;
      case 'clear':
        setHistory([]);
        setInput('');
        return;
      case 'exit':
        onClose();
        setInput('');
        return;
      case 'login':
        output = (
          <div className="flex flex-col gap-1 text-yellow-400">
            <span>SECURITY PROTOCOL INITIATED.</span>
            <span>Answer the following riddle to proceed:</span>
            <span>{RIDDLE}</span>
          </div>
        );
        setMode('riddle');
        break;
      case 'whoami':
        const { data: { user } } = await supabase.auth.getUser();
        output = user ? `Logged in as: ${user.email}` : 'Not logged in. Guest access.';
        break;
      default:
        output = `Command not found: ${mainCmd}. Type "help" for available commands.`;
    }

    newHistory[newHistory.length - 1].output = output;
    setHistory(newHistory);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(input);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <div 
            className="w-full max-w-3xl h-[60vh] bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl flex flex-col overflow-hidden font-mono text-sm"
            onClick={e => e.stopPropagation()}
          >
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-zinc-400">
                <TerminalIcon size={16} />
                <span>SLC_SECURE_TERMINAL_v1.0.4</span>
              </div>
              <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Terminal Body */}
            <div 
              className="flex-1 p-4 overflow-y-auto text-emerald-400 flex flex-col gap-2"
              onClick={() => inputRef.current?.focus()}
            >
              {history.map((item, i) => (
                <div key={i} className="flex flex-col gap-1">
                  {item.input && (
                    <div className="flex gap-2 text-zinc-300">
                      <span className="text-emerald-500">slc@binus:~$</span>
                      <span>{item.input}</span>
                    </div>
                  )}
                  {item.output && <div className="whitespace-pre-wrap opacity-90">{item.output}</div>}
                </div>
              ))}
              
              <div className="flex gap-2 text-zinc-300 mt-2">
                <span className="text-emerald-500">
                  {mode === 'normal' ? 'slc@binus:~$' : mode === 'riddle' ? 'riddle>' : mode === 'login_email' ? 'email>' : 'password>'}
                </span>
                <input
                  ref={inputRef}
                  type={mode === 'login_password' ? 'password' : 'text'}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent outline-none border-none text-emerald-400"
                  autoComplete="off"
                  spellCheck="false"
                />
              </div>
              <div ref={bottomRef} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
