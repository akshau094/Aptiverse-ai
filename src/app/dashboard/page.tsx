'use client';

import { motion } from 'framer-motion';
import { Mic, BrainCircuit, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Scene from '@/components/Scene';

export default function Dashboard() {
  const router = useRouter();

  const cards = [
    {
      title: 'Communication Coach',
      description: 'Experience a realistic mock interview with Gemini AI. Get instant feedback and improve your communication.',
      icon: <Mic className="w-8 h-8 text-blue-600" />,
      color: 'bg-white',
      borderColor: 'border-blue-100',
      hoverBorder: 'hover:border-blue-400',
      shadow: 'shadow-blue-50',
      link: '/interview'
    },
    {
      title: 'Aptitude Master',
      description: 'Practice company-specific aptitude questions. Master quantitative, logical, and verbal reasoning.',
      icon: <BrainCircuit className="w-8 h-8 text-emerald-600" />,
      color: 'bg-white',
      borderColor: 'border-emerald-100',
      hoverBorder: 'hover:border-emerald-400',
      shadow: 'shadow-emerald-50',
      link: '/aptitude?mode=test'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const
      }
    }
  };

  return (
    <main className="relative min-h-screen text-slate-900 overflow-hidden bg-white">
      <Scene />
      
      {/* Background Decorative Elements */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-50/50 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-50/50 blur-[120px] rounded-full pointer-events-none z-0" />
      
      {/* Header */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="z-50 sticky top-0 flex justify-between items-center px-8 py-5 bg-white/70 backdrop-blur-xl border-b border-slate-100 shadow-sm"
      >
        <motion.h1 
          whileHover={{ scale: 1.05 }}
          className="text-2xl font-black text-slate-900 cursor-pointer"
          onClick={() => router.push('/')}
        >
          Apti<span className="text-blue-600">Verse</span>
        </motion.h1>
      </motion.nav>

      <div className="z-10 relative max-w-6xl mx-auto px-6 py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center mb-20"
        >
          <motion.h2 
            variants={itemVariants}
            className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-slate-900"
          >
            Choose Your <span className="text-blue-600">Path</span>
          </motion.h2>
          <motion.p 
            variants={itemVariants}
            className="text-slate-500 text-xl font-medium max-w-2xl mx-auto"
          >
            Select a module to start your preparation with our advanced AI tools.
          </motion.p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 gap-10"
        >
          {cards.map((card) => (
            <motion.div
              key={card.title}
              variants={itemVariants}
              whileHover={{ y: -12, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(card.link)}
              className={`cursor-pointer group relative overflow-hidden rounded-[3rem] border ${card.borderColor} ${card.hoverBorder} ${card.color} p-12 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] transition-all duration-500`}
            >
              {/* Animated background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-50/0 via-slate-50/0 to-blue-50/0 group-hover:from-white group-hover:to-blue-50/50 transition-all duration-700" />
              
              <div className="relative z-10">
                <div className="mb-10 p-6 rounded-2xl bg-slate-50 w-fit group-hover:scale-110 group-hover:bg-white transition-all duration-500 border border-slate-100 group-hover:border-transparent group-hover:shadow-xl shadow-sm">
                  {card.icon}
                </div>
                <h3 className="text-4xl font-black mb-5 text-slate-900 group-hover:text-blue-600 transition-colors">
                  {card.title}
                </h3>
                <p className="text-slate-500 text-lg leading-relaxed mb-10 font-medium group-hover:text-slate-600 transition-colors">
                  {card.description}
                </p>
                <div className="flex items-center text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] group-hover:text-blue-600 transition-all">
                  <span>Start Preparation</span>
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-all" />
                </div>
              </div>
              
              {/* Decorative background shapes */}
              <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-slate-50 rounded-full blur-3xl group-hover:bg-blue-100/50 transition-colors duration-700" />
              <div className="absolute -left-12 -top-12 w-32 h-32 bg-indigo-50/20 rounded-full blur-2xl group-hover:bg-indigo-100/30 transition-colors duration-700" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </main>
  );
}
