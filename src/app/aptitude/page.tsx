'use client';

import { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Building2, ArrowLeft, CheckCircle2, Send } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Scene from '@/components/Scene';

function SelectionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const mode = searchParams.get('mode') || 'test';

  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  const toggleLanguage = (name: string) => {
    setSelectedLanguages(prev => 
      prev.includes(name) ? prev.filter(l => l !== name) : [...prev, name]
    );
  };

  const toggleCompany = (name: string) => {
    setSelectedCompany(prev => prev === name ? null : name);
  };

  const handleSubmit = () => {
    if (selectedLanguages.length === 0 && !selectedCompany) {
      alert("Please select at least one language or a company!");
      return;
    }
    const params = new URLSearchParams();
    if (selectedLanguages.length > 0) params.set('langs', selectedLanguages.join(','));
    if (selectedCompany) params.set('company', selectedCompany);
    
    if (mode === 'interview') {
      router.push(`/interview?${params.toString()}`);
    } else {
      router.push(`/aptitude/test?${params.toString()}`);
    }
  };

  const languages = [
    { name: 'DSA', icon: '📊', color: 'bg-emerald-50', borderColor: 'border-emerald-100' },
    { name: 'Python', icon: '🐍', color: 'bg-blue-50', borderColor: 'border-blue-100' },
    { name: 'Java', icon: '☕', color: 'bg-orange-50', borderColor: 'border-orange-100' },
    { name: 'C++', icon: '💻', color: 'bg-blue-50', borderColor: 'border-blue-100' },
    { name: 'JavaScript', icon: '🟨', color: 'bg-yellow-50', borderColor: 'border-yellow-100' },
  ];

  const companies = [
    { name: 'Google', icon: '🔍', color: 'bg-slate-50', borderColor: 'border-slate-100' },
    { name: 'Microsoft', icon: '🪟', color: 'bg-blue-50', borderColor: 'border-blue-100' },
    { name: 'Amazon', icon: '📦', color: 'bg-orange-50', borderColor: 'border-orange-100' },
    { name: 'TCS', icon: '🏢', color: 'bg-blue-50', borderColor: 'border-blue-100' },
    { name: 'Infosys', icon: '🔷', color: 'bg-blue-50', borderColor: 'border-blue-100' },
    { name: 'Wipro', icon: '🌐', color: 'bg-purple-50', borderColor: 'border-purple-100' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0, scale: 0.95 },
    visible: { 
      y: 0, 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const
      }
    }
  };

  return (
    <div className="z-10 relative max-w-7xl mx-auto px-6 py-12 space-y-24">
      
      {/* Section 1: Languages */}
      <section>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-6 mb-12"
        >
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 shadow-sm">
            <Globe className="w-10 h-10 text-blue-600" />
          </div>
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Practice by <span className="text-blue-600">Language</span></h2>
            <p className="text-slate-500 text-lg font-medium">Master coding aptitude in your favorite language</p>
          </div>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6"
        >
          {languages.map((item) => {
            const isSelected = selectedLanguages.includes(item.name);
            return (
              <motion.div
                key={item.name}
                variants={itemVariants}
                whileHover={{ y: -10, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleLanguage(item.name)}
                className={`cursor-pointer group p-8 rounded-[3rem] border transition-all duration-500 relative overflow-hidden ${
                  isSelected 
                    ? 'border-blue-600 bg-blue-50/50 shadow-[0_20px_40px_rgba(59,130,246,0.1)]' 
                    : `border-slate-100 bg-white hover:border-blue-200 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)]`
                }`}
              >
                <AnimatePresence>
                  {isSelected && (
                    <motion.div 
                      initial={{ scale: 0, opacity: 0, rotate: -45 }} 
                      animate={{ scale: 1, opacity: 1, rotate: 0 }} 
                      exit={{ scale: 0, opacity: 0, rotate: 45 }}
                      className="absolute top-6 right-6 text-blue-600 z-10"
                    >
                      <CheckCircle2 className="w-8 h-8 fill-blue-50" />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative z-0">
                  <div className="text-6xl mb-8 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">{item.icon}</div>
                  <h3 className="text-2xl font-black mb-2 text-slate-900">{item.name}</h3>
                  <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>
                    {isSelected ? 'Selected' : 'Select Category'}
                  </p>
                </div>
                
                {/* Decorative background pulse */}
                {isSelected && (
                  <motion.div 
                    layoutId="pulse"
                    className="absolute inset-0 bg-blue-600/5 z-[-1]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  />
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Section 2: Companies */}
      <section>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-6 mb-12"
        >
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 shadow-sm">
            <Building2 className="w-10 h-10 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Practice by <span className="text-emerald-600">Company</span></h2>
            <p className="text-slate-500 text-lg font-medium">Crack the interview patterns of top tech giants</p>
          </div>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {companies.map((item) => {
            const isSelected = selectedCompany === item.name;
            return (
              <motion.div
                key={item.name}
                variants={itemVariants}
                whileHover={{ y: -10, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleCompany(item.name)}
                className={`cursor-pointer group p-10 rounded-[3rem] border transition-all duration-500 relative overflow-hidden ${
                  isSelected 
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-[0_20px_40px_rgba(16,185,129,0.1)]' 
                    : `border-slate-100 bg-white hover:border-emerald-200 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)]`
                }`}
              >
                <AnimatePresence>
                  {isSelected && (
                    <motion.div 
                      initial={{ scale: 0, opacity: 0, rotate: -45 }} 
                      animate={{ scale: 1, opacity: 1, rotate: 0 }} 
                      exit={{ scale: 0, opacity: 0, rotate: 45 }}
                      className="absolute top-8 right-8 text-emerald-600 z-10"
                    >
                      <CheckCircle2 className="w-8 h-8 fill-emerald-50" />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative z-0">
                  <div className="text-7xl mb-8 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">{item.icon}</div>
                  <h3 className="text-3xl font-black mb-2 text-slate-900">{item.name}</h3>
                  <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {isSelected ? 'Target Company' : 'Select Company'}
                  </p>
                </div>

                {isSelected && (
                  <motion.div 
                    layoutId="pulse-emerald"
                    className="absolute inset-0 bg-emerald-600/5 z-[-1]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  />
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Submit Section */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex flex-col items-center justify-center py-20 border-t border-slate-100"
      >
        <motion.button
          whileHover={(selectedLanguages.length > 0 || selectedCompany) ? { scale: 1.05, y: -5 } : {}}
          whileTap={(selectedLanguages.length > 0 || selectedCompany) ? { scale: 0.95 } : {}}
          onClick={handleSubmit}
          className={`group flex items-center gap-4 px-16 py-6 rounded-[2.5rem] text-2xl font-black transition-all duration-500 shadow-2xl relative overflow-hidden ${
            (selectedLanguages.length > 0 || selectedCompany)
              ? 'bg-slate-900 text-white cursor-pointer shadow-slate-200'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50 shadow-none'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-white/10 to-blue-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          <Send className={`w-7 h-7 transition-transform duration-500 group-hover:translate-x-2 group-hover:-translate-y-2`} />
          <span className="relative z-10">
            {mode === 'interview' ? 'Start Mock Interview' : 'Start Aptitude Test'}
          </span>
        </motion.button>
        <motion.p 
          animate={(selectedLanguages.length > 0 || selectedCompany) ? { scale: [1, 1.05, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
          className="mt-8 text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]"
        >
          {(selectedLanguages.length > 0 || selectedCompany) 
            ? `Ready with ${selectedLanguages.length + (selectedCompany ? 1 : 0)} selection${(selectedLanguages.length + (selectedCompany ? 1 : 0)) > 1 ? 's' : ''}`
            : 'Select at least one category to proceed'}
        </motion.p>
      </motion.div>

    </div>
  );
}

export default function AptitudePage() {
  return (
    <main className="relative min-h-screen text-slate-900 overflow-x-hidden pb-20 bg-white">
      <Scene />
      
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="z-50 relative flex justify-between items-center px-8 py-5 bg-white/70 backdrop-blur-xl border-b border-slate-100 sticky top-0 shadow-sm"
      >
        <Link href="/dashboard" className="flex items-center gap-3 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:text-slate-900 transition-all group">
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-white group-hover:shadow-md transition-all">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          </div>
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="text-2xl font-black text-slate-900 tracking-tighter">
          AptiVerse<span className="text-blue-600">.</span>Selection
        </h1>
        <div className="w-40 hidden md:block"></div>
      </motion.nav>

      <Suspense fallback={<div className="text-center py-20 font-bold text-slate-400 animate-pulse">Loading selection...</div>}>
        <SelectionContent />
      </Suspense>
    </main>
  );
}
