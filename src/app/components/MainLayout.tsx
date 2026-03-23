import React from 'react';
import { Navbar } from './Navbar';
import { motion } from 'framer-motion';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <Navbar />
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1 pb-12"
      >
        {children}
      </motion.main>
      
      <footer className="py-8 border-t border-slate-200 bg-white/50 backdrop-blur-sm text-center">
        <p className="text-slate-500 text-sm font-medium">
          Developed by <span className="text-slate-900 font-bold">Vuyo Mbanjwa</span>
        </p>
        <p className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black mt-1">
          Professional Cloud Solutions
        </p>
      </footer>
    </div>
  );
}
