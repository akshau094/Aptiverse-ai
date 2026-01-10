'use client';

import Scene from '@/components/Scene';
import { motion } from 'framer-motion';

import { Mic, BrainCircuit, ChevronRight, Target, Zap, BarChart3, User as UserIcon } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const features = [
    {
      title: 'Communication Coach',
      description: 'Master your communication with real-time feedback on confidence, pace, and professional delivery.',
      icon: <Mic className="w-6 h-6 text-blue-600" />,
      color: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-100',
      link: '/interview'
    },
    {
      title: 'Aptitude Master',
      description: 'Master company-specific aptitude questions with our advanced AI problem solver.',
      icon: <BrainCircuit className="w-6 h-6 text-emerald-600" />,
      color: 'from-emerald-50 to-teal-50',
      borderColor: 'border-emerald-100',
      link: '/aptitude?mode=test'
    }
  ];

  const highlights = [
    {
      title: 'Real-time Analysis',
      description: 'Get instant feedback on your performance using advanced AI vision and speech models.',
      icon: <Zap className="w-5 h-5 text-amber-500" />
    },
    {
      title: 'Expert Feedback',
      description: 'Detailed insights on how to improve your confidence, pace, and problem-solving skills.',
      icon: <Target className="w-5 h-5 text-rose-500" />
    },
    {
      title: 'Adaptive Learning',
      description: 'Our simulator adapts to your progress, providing increasingly challenging scenarios.',
      icon: <BarChart3 className="w-5 h-5 text-blue-600" />
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Select Module',
      description: 'Choose between Communication Coach or Aptitude Master to start your training session.'
    },
    {
      number: '02',
      title: 'Interactive Practice',
      description: 'Engage with our AI-driven simulator in real-time scenarios designed for your role.'
    },
    {
      number: '03',
      title: 'Analyze & Improve',
      description: 'Review your personalized feedback and performance metrics to track your growth.'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const
      }
    }
  };

  return (
    <main className="relative min-h-screen bg-white text-slate-900 overflow-x-hidden">
      <Scene />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-6 flex justify-between items-center bg-white/70 backdrop-blur-xl border-b border-slate-100">
        <h1 className="text-2xl font-black text-slate-900 tracking-tighter">
          Apti<span className="text-blue-600">Verse</span>
        </h1>
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            <UserIcon size={16} />
            Dashboard
          </Link>
        </div>
      </nav>

      {/* Background Glows */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-50/50 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="fixed top-0 right-0 w-[400px] h-[400px] bg-indigo-50/50 blur-[100px] rounded-full pointer-events-none z-0" />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-start pt-48 pb-32 px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="z-10 text-center max-w-6xl w-full"
        >
          <motion.div
            variants={itemVariants}
            className="inline-block mb-8 px-5 py-2 rounded-full bg-slate-50 border border-slate-200 backdrop-blur-md shadow-sm"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Next-Gen Interview Prep Platform</span>
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="text-7xl md:text-[10rem] font-black mb-8 tracking-tighter text-slate-900 leading-[0.9]"
          >
            AptiVerse<span className="text-blue-600">.</span>AI
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-2xl text-slate-500 mb-20 max-w-3xl mx-auto font-medium leading-relaxed"
          >
            Train smart and think faster with our elite AI-driven simulator. 
            Real-time analysis and expert feedback to land your dream role.
          </motion.p>

          <motion.div 
            variants={containerVariants}
            className="grid md:grid-cols-2 gap-8 w-full max-w-5xl mx-auto mb-32"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ y: -10, scale: 1.02 }}
                className="h-full"
              >
                <Link href={feature.link} className="group block relative h-full">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-40 blur-3xl transition-opacity duration-500`} />
                  
                  <div className={`relative h-full p-10 rounded-[40px] bg-white border ${feature.borderColor} shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(59,130,246,0.1)] transition-all duration-500 flex flex-col items-start text-left overflow-hidden`}>
                    <div className="mb-10 relative">
                      <div className="absolute inset-0 bg-slate-100 blur-2xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-700" />
                      <div className="relative z-10 w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm">
                        {feature.icon}
                      </div>
                    </div>
                    
                    <h3 className="text-3xl font-black mb-4 text-slate-900 group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </h3>
                    
                    <p className="text-slate-500 text-base leading-relaxed mb-10 group-hover:text-slate-600 transition-colors font-medium">
                      {feature.description}
                    </p>
                    
                    <div className="mt-auto flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-blue-600 transition-all">
                      <span>Launch Module</span>
                      <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Stats/Highlights */}
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto border-t border-slate-100 pt-16"
          >
            {highlights.map((item, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center md:items-start text-center md:text-left gap-4 p-6 rounded-3xl hover:bg-slate-50/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900 mb-1">{item.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* How it Works Section */}
      <section className="relative py-32 px-4 z-10 bg-slate-50/30">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-slate-900">How it <span className="text-blue-600">Works</span></h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">Our streamlined process helps you go from preparation to performance in three simple steps.</p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-12"
          >
            {steps.map((step, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="relative group"
              >
                <div className="text-[10rem] font-black text-slate-100 absolute -top-20 -left-4 leading-none select-none group-hover:text-blue-50 transition-colors duration-500">
                  {step.number}
                </div>
                <div className="relative z-10 pt-8">
                  <h3 className="text-3xl font-black mb-4 text-slate-900 group-hover:text-blue-600 transition-colors">{step.title}</h3>
                  <p className="text-slate-500 text-lg leading-relaxed font-medium group-hover:text-slate-600 transition-colors">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="relative py-32 px-4 z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto rounded-[4rem] bg-slate-900 p-12 md:p-24 text-center relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full" />
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-600/20 blur-[100px] rounded-full" />
          
          <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tight text-white">Ready to <span className="text-blue-400">excel?</span></h2>
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">Join thousands of candidates who used AptiVerse to master their interviews and aptitude tests.</p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
            <Link href="/dashboard" className="w-full sm:w-auto px-12 py-5 rounded-2xl bg-white text-slate-950 font-black uppercase tracking-widest hover:bg-blue-50 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/10">
              Get Started Free
            </Link>
            <Link href="/aptitude?mode=test" className="w-full sm:w-auto px-12 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest hover:bg-white/10 transition-all hover:scale-105 active:scale-95">
              Try Aptitude Test
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-20 px-4 border-t border-slate-100 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <h3 className="text-2xl font-black mb-6 text-slate-900">AptiVerse<span className="text-blue-600">.</span>AI</h3>
            <p className="text-slate-500 max-w-sm leading-relaxed">
              The ultimate AI-powered preparation platform for the modern workforce. 
              Master communication, aptitude, and professional skills with real-time feedback.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-slate-900">Modules</h4>
            <ul className="space-y-4 text-slate-500 text-sm">
              <li><Link href="/interview" className="hover:text-blue-600 transition-colors">Communication Coach</Link></li>
              <li><Link href="/aptitude?mode=test" className="hover:text-blue-600 transition-colors">Aptitude Master</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Mock Interviews</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Skill Assessments</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-slate-900">Platform</h4>
            <ul className="space-y-4 text-slate-500 text-sm">
              <li><Link href="#" className="hover:text-blue-600 transition-colors">How it Works</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Pricing</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-20 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
          <p>© 2024 AptiVerse.AI. All rights reserved.</p>
          <div className="flex gap-8">
            <Link href="#" className="hover:text-slate-900 transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">LinkedIn</Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">GitHub</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
