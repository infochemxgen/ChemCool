import React from 'react';
import { Beaker } from 'lucide-react';
import { motion } from 'motion/react';

export const Loading: React.FC = () => {
  return (
    <div className="min-h-screen bg-industrial-950 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.5,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        className="relative"
      >
        <div className="absolute -inset-4 bg-accent-emerald/20 blur-xl rounded-full animate-pulse"></div>
        <Beaker className="w-16 h-16 text-accent-emerald relative z-10" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-6 text-zinc-muted font-mono text-sm tracking-widest uppercase"
      >
        Initializing ChemXGen Systems...
      </motion.p>
    </div>
  );
};
