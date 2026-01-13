'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ChevronRight, Trophy, Timer, Bot, Sparkles, Loader2, Volume2, VolumeX, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Scene from '@/components/Scene';
import { getQuestions, Question } from '@/lib/questions';

function TestContent() {
  const searchParams = useSearchParams();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const speak = (text: string) => {
    if (isMuted) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const langs = searchParams.get('langs')?.split(',') || [];
    const company = searchParams.get('company');
    const filteredQuestions = getQuestions(langs, company);
    setQuestions(filteredQuestions);
  }, [searchParams]);

  useEffect(() => {
    if (timeLeft > 0 && !isFinished) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setIsFinished(true);
    }
  }, [timeLeft, isFinished]);

  const handleOptionSelect = async (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    const currentQ = questions[currentIndex];
    
    if (index === currentQ.correctAnswer) {
      setScore(prev => prev + 1);
      setAiExplanation(null);
    } else {
      // Trigger AI Chatbot for wrong answers
      setIsAiLoading(true);
      try {
        const response = await fetch("/api/aptitude/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: currentQ.question,
            correctAnswer: currentQ.options[currentQ.correctAnswer],
            userAnswer: currentQ.options[index],
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          const errorMsg = `ERROR: ${data.error || "AI Service Unavailable"}. ${data.details || "Please check your configuration."}`;
          setAiExplanation(errorMsg);
          speak(errorMsg);
        } else {
          const explanation = data.explanation;
          setAiExplanation(explanation);
          // Intro phrase then explanation
          speak(`AptiVerse.Live Assessment. ${explanation}`);
        }
      } catch (err: any) {
        const fallback = `AI Error: ${err.message || "Failed to connect to AI service"}. 
        
        How to fix: Go to Vercel → Project Settings → Environment Variables. Add GEMINI_API_KEY with: AIzaSyB193PR6SZRZiYg978w9Rk7UoMO2c1P6aY, then redeploy.`;
        setAiExplanation(fallback);
        speak(fallback);
      } finally {
        setIsAiLoading(false);
      }
    }
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
      setAiExplanation(null);
    } else {
      setIsFinished(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-2xl font-bold mb-4">No questions found for this selection.</h2>
        <Link href="/aptitude" className="text-blue-400 hover:underline">Go back and select again</Link>
      </div>
    );
  }

  if (isFinished) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-2xl mx-auto bg-white/80 backdrop-blur-2xl p-16 rounded-[3rem] border border-slate-100 text-center shadow-[0_30px_60px_rgba(0,0,0,0.1)] relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-emerald-500 to-blue-500" />
        
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 12, delay: 0.2 }}
          className="mb-10 p-8 rounded-full bg-emerald-50 w-fit mx-auto shadow-inner"
        >
          <Trophy className="w-24 h-24 text-emerald-500" />
        </motion.div>
        
        <h2 className="text-6xl font-black mb-4 text-slate-900 tracking-tighter">Test Completed!</h2>
        <p className="text-xl text-slate-500 mb-10 font-medium">Excellent work! Here is your final performance summary:</p>
        
        <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600 mb-12 drop-shadow-sm">
          {score} / {questions.length}
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="p-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 transition-all font-black uppercase tracking-widest text-xs"
          >
            Try Again
          </motion.button>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link 
              href="/aptitude"
              className="block p-5 rounded-2xl bg-slate-900 hover:bg-slate-800 transition-all font-black uppercase tracking-widest text-xs text-white shadow-xl shadow-slate-200"
            >
              Finish Review
            </Link>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Info */}
      <div className="flex justify-between items-end mb-10 px-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-5 bg-white/80 backdrop-blur-md px-8 py-4 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/50"
        >
          <div className={`p-2 rounded-full ${timeLeft < 60 ? 'bg-red-50 text-red-500 animate-pulse' : 'bg-blue-50 text-blue-600'}`}>
            <Timer className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Time Remaining</span>
            <span className={`font-mono text-2xl font-black ${timeLeft < 60 ? 'text-red-600' : 'text-slate-900'}`}>{formatTime(timeLeft)}</span>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <button
            onClick={() => {
              if (!isMuted) window.speechSynthesis.cancel();
              setIsMuted(!isMuted);
            }}
            className={`p-4 rounded-[1.5rem] border transition-all ${isMuted ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-white border-slate-100 text-slate-400 hover:text-blue-600 shadow-xl shadow-slate-100/50'}`}
            title={isMuted ? "Unmute AI" : "Mute AI"}
          >
            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className={`w-6 h-6 ${isSpeaking ? 'animate-pulse text-blue-600' : ''}`} />}
          </button>
          <div className="text-right">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Progress</div>
            <div className="text-3xl font-black text-slate-900">
              {currentIndex + 1}<span className="text-slate-300 mx-1">/</span><span className="text-slate-400 text-xl">{questions.length}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-slate-100 rounded-full mb-16 overflow-hidden p-1 shadow-inner">
        <motion.div 
          className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)]"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.98 }}
          className="bg-white/80 backdrop-blur-2xl p-12 rounded-[3rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8">
            <div className="px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-blue-600">
              {currentQ.topic}
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-black mb-12 leading-[1.3] text-slate-900 max-w-2xl">
            {currentQ.question}
          </h2>

          <div className="grid gap-5">
            {currentQ.options.map((option, idx) => {
              const isCorrect = idx === currentQ.correctAnswer;
              const isSelected = selectedOption === idx;
              
              let cardStyle = "border-slate-100 bg-white hover:border-blue-200 hover:shadow-lg text-slate-900";
              if (selectedOption !== null) {
                if (isCorrect) cardStyle = "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-[0_0_30px_rgba(16,185,129,0.15)] scale-[1.02] z-10";
                else if (isSelected) cardStyle = "border-red-500 bg-red-50 text-red-700 shadow-[0_0_30px_rgba(239,68,68,0.15)]";
                else cardStyle = "border-slate-50 bg-slate-50/50 opacity-40 grayscale-[0.5]";
              }

              return (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={selectedOption === null ? { x: 10 } : {}}
                  disabled={selectedOption !== null}
                  onClick={() => handleOptionSelect(idx)}
                  className={`flex items-center justify-between p-7 rounded-[2rem] border text-left transition-all duration-500 group relative overflow-hidden ${cardStyle}`}
                >
                  <div className="flex items-center gap-6 relative z-10">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border transition-all duration-500 ${
                      isSelected ? 'bg-current text-white border-transparent' : 'bg-slate-50 border-slate-100 text-slate-400 group-hover:bg-white group-hover:border-blue-200 group-hover:text-blue-600'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="text-xl font-bold tracking-tight">{option}</span>
                  </div>
                  
                  <div className="relative z-10">
                    {selectedOption !== null && isCorrect && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <CheckCircle2 className="w-8 h-8 text-emerald-600 fill-emerald-50" />
                      </motion.div>
                    )}
                    {selectedOption !== null && isSelected && !isCorrect && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <XCircle className="w-8 h-8 text-red-600 fill-red-50" />
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {showExplanation && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="overflow-hidden"
              >
                <div className="pt-12 space-y-8">
                  {/* Standard Explanation */}
                  {selectedOption === currentQ.correctAnswer && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-8 rounded-[2.5rem] bg-emerald-50/50 border border-emerald-100 shadow-inner"
                    >
                      <h4 className="font-black text-emerald-700 mb-3 flex items-center gap-3 uppercase tracking-widest text-xs">
                        <CheckCircle2 size={18} /> Logic Analysis
                      </h4>
                      <p className="text-slate-600 leading-relaxed text-lg font-medium">{currentQ.explanation}</p>
                    </motion.div>
                  )}

                  {/* AI Tutor Explanation for Wrong Answers */}
                  {selectedOption !== null && selectedOption !== currentQ.correctAnswer && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group"
                    >
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-[3rem] blur opacity-10 group-hover:opacity-25 transition duration-1000"></div>
                      <div className="relative p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-2xl">
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-2xl shadow-blue-500/30">
                              <Bot className="text-white w-9 h-9" />
                            </div>
                            <div>
                              <h4 className="text-2xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
                                AI Tutor
                                <Sparkles size={18} className="text-blue-500 animate-pulse" />
                              </h4>
                              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Step-by-step guidance</p>
                            </div>
                          </div>
                          <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Deep Learning Mode
                          </div>
                        </div>

                        <div className="bg-slate-50/50 rounded-3xl p-8 border border-slate-100 shadow-inner">
                          {isAiLoading ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-5">
                              <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                              <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 animate-pulse">Generating Insightful Feedback...</p>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              <div className="space-y-4">
                                {aiExplanation?.split('\n\n').map((paragraph, i) => (
                                  <p key={i} className={`leading-relaxed text-lg font-medium ${
                                    aiExplanation.startsWith("ERROR") || aiExplanation.startsWith("AI Error")
                                    ? "text-rose-700"
                                    : "text-slate-700"
                                  }`}>
                                    {paragraph}
                                  </p>
                                ))}
                              </div>

                              {(aiExplanation?.includes("GEMINI_API_KEY") || aiExplanation?.includes("AI Configuration Issue") || aiExplanation?.includes("missing")) && (
                                <div className="mt-6 p-6 bg-rose-50 border border-rose-100 rounded-3xl text-sm text-rose-700">
                                  <div className="flex items-center gap-2 mb-3">
                                    <AlertCircle size={16} className="text-rose-600" />
                                    <strong className="font-black uppercase tracking-widest text-[10px]">How to fix:</strong>
                                  </div>
                                  <div className="space-y-3 font-medium">
                                    <p>Go to your <strong>Vercel Dashboard</strong> → <strong>Project Settings</strong> → <strong>Environment Variables</strong>.</p>
                                    <div className="bg-white/50 p-3 rounded-xl border border-rose-100">
                                      <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-rose-400">Add/Update Variable:</p>
                                      <code className="text-rose-900 break-all bg-rose-100/50 px-2 py-1 rounded">GEMINI_API_KEY</code>
                                      <p className="mt-2 mb-1 text-[10px] font-black uppercase tracking-widest text-rose-400">Value:</p>
                                      <code className="text-rose-900 break-all bg-rose-100/50 px-2 py-1 rounded">AIzaSyB193PR6SZRZiYg978w9Rk7UoMO2c1P6aY</code>
                                    </div>
                                    <p className="text-xs italic opacity-70">After updating, you MUST <strong>Redeploy</strong> your project for changes to take effect.</p>
                                  </div>
                                </div>
                              )}
                              <div className="pt-6 border-t border-slate-200 flex items-center gap-3">
                                <div className="flex -space-x-2">
                                  {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white" />)}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Always learning with you</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={nextQuestion}
                    className="w-full flex items-center justify-center gap-4 py-6 rounded-[2rem] bg-slate-900 hover:bg-slate-800 transition-all font-black uppercase tracking-[0.2em] text-sm text-white shadow-[0_20px_40px_rgba(0,0,0,0.15)]"
                  >
                    <span>{currentIndex === questions.length - 1 ? 'Complete Assessment' : 'Next Challenge'}</span>
                    <ChevronRight className="w-6 h-6" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function AptitudeTestPage() {
  return (
    <main className="relative min-h-screen text-slate-900 overflow-x-hidden pb-20 bg-white">
      <Scene />
      
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="z-50 relative flex justify-between items-center px-8 py-5 bg-white/70 backdrop-blur-xl border-b border-slate-100 mb-16 sticky top-0 shadow-sm"
      >
        <Link 
          href="/aptitude" 
          onClick={() => window.speechSynthesis.cancel()}
          className="flex items-center gap-3 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:text-red-500 transition-all group"
        >
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-red-50 group-hover:border-red-100 transition-all">
            <XCircle size={16} />
          </div>
          <span>Quit Session</span>
        </Link>
        <h1 className="text-2xl font-black text-slate-900 tracking-tighter">
          AptiVerse<span className="text-blue-600">.</span>Live Assessment
        </h1>
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Secure Environment</span>
          </div>
        </div>
      </motion.nav>

      <div className="z-10 relative px-6">
        <Suspense fallback={<div className="text-center py-20 text-slate-500 font-bold">Loading test...</div>}>
          <TestContent />
        </Suspense>
      </div>
    </main>
  );
}
