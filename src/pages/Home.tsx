import React from 'react';
import { motion } from 'motion/react';
import { Calendar, Bell, ChevronRight } from 'lucide-react';

const EVENTS = [
  {
    id: 1,
    title: 'Introduction to React & Vite',
    date: '2026-03-15',
    time: '13:00 - 15:00',
    location: 'Lab 1, SLC Binus @Semarang',
    type: 'Workshop',
  },
  {
    id: 2,
    title: 'Competitive Programming Selection',
    date: '2026-03-20',
    time: '09:00 - 12:00',
    location: 'Lab 2, SLC Binus @Semarang',
    type: 'Competition',
  },
];

const ANNOUNCEMENTS = [
  {
    id: 1,
    title: 'New Lab Assistant Recruitment',
    date: '2026-03-10',
    content: 'We are opening recruitment for new lab assistants for the upcoming semester. Prepare your CV and portfolio.',
  },
  {
    id: 2,
    title: 'Server Maintenance',
    date: '2026-03-12',
    content: 'The main database server will undergo maintenance this weekend. Please backup your projects.',
  },
];

export function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-indigo-950 text-white px-8 py-24 sm:px-16">
        <div className="absolute inset-0 opacity-10 bg-[url('https://picsum.photos/seed/tech/1920/1080')] bg-cover bg-center mix-blend-overlay" />
        <div className="relative z-10 max-w-2xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-bold tracking-tight mb-6"
          >
            Software Laboratory Center
            <span className="block text-indigo-400">Binus @Semarang</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-indigo-100/80 mb-8"
          >
            Empowering students through practical software engineering experience, research, and innovation.
          </motion.p>
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Upcoming Events */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="text-indigo-600" />
            <h2 className="text-2xl font-semibold">Upcoming Events</h2>
          </div>
          <div className="space-y-4">
            {EVENTS.map((event, i) => (
              <motion.div 
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700">
                    {event.type}
                  </span>
                  <span className="text-sm text-zinc-500">{event.date}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-indigo-600 transition-colors">
                  {event.title}
                </h3>
                <div className="text-sm text-zinc-600 space-y-1">
                  <p>{event.time}</p>
                  <p>{event.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Announcements */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Bell className="text-indigo-600" />
            <h2 className="text-2xl font-semibold">Announcements</h2>
          </div>
          <div className="space-y-4">
            {ANNOUNCEMENTS.map((announcement, i) => (
              <motion.div 
                key={announcement.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-zinc-100 border border-zinc-200/50"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold">{announcement.title}</h3>
                </div>
                <p className="text-zinc-600 text-sm leading-relaxed mb-4">
                  {announcement.content}
                </p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-200/50">
                  <span className="text-xs text-zinc-500">{announcement.date}</span>
                  <button className="text-sm font-medium text-indigo-600 flex items-center hover:text-indigo-700">
                    Read more <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
