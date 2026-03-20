import React from 'react';
import { Navbar } from './Navbar';
import { motion } from 'framer-motion';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="pb-12"
      >
        {children}
      </motion.main>
    </div>
  );
}
