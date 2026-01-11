'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, MessageSquare, ArrowLeft, RefreshCw, Volume2, VolumeX, Sparkles, Video, VideoOff, Activity, Award, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { startInterview } from '@/lib/gemini';

const PRACTICE_PARAGRAPHS: string[] = [
  "I approach complex problems by breaking them into clear steps, validating assumptions early, and communicating progress transparently. In previous projects, I balanced speed with quality by writing small, testable changes and reviewing edge cases with stakeholders. I stay calm under pressure, ask clarifying questions when requirements shift, and take ownership of outcomes. I’m excited to contribute strong execution, thoughtful collaboration, and continuous improvement to the team’s goals.",
  "When I start a new assignment, I first align on success criteria, deadlines, and constraints. Then I create a simple plan, prioritize the highest-impact work, and track risks before they become blockers. I’m comfortable collaborating across teams, sharing updates regularly, and adapting quickly based on feedback. My goal is to deliver reliable results while keeping communication clear, professional, and focused on measurable outcomes.",
  "I believe strong delivery comes from clarity of thought and confidence in structure. I begin with a brief summary, explain my reasoning in a logical flow, and close with a clear conclusion or next step. If I don’t know something, I say so directly and outline how I would find the answer. This approach helps build trust, keeps conversations efficient, and demonstrates accountability and growth mindset.",
  "In team settings, I aim to be dependable and proactive. I document decisions, confirm requirements, and make sure everyone understands trade-offs. I’m comfortable receiving feedback and using it to improve quickly. When challenges arise, I focus on solutions, communicate early, and coordinate support where needed. I’m motivated by meaningful work and I take pride in delivering results that are both accurate and easy to maintain.",
  "I stay effective by combining preparation with adaptability. Before important discussions, I review context, anticipate questions, and prepare concise talking points. During the conversation, I listen carefully, respond with clarity, and adjust based on what the audience needs. This helps me present ideas confidently, avoid filler language, and maintain a steady pace. Over time, I’ve developed strong communication habits that support better outcomes.",
  "My work style is structured, detail-aware, and results-driven. I prioritize tasks based on impact, execute with consistency, and keep quality high through careful review. I communicate clearly with stakeholders, especially when timelines or scope changes. I also enjoy mentoring and sharing knowledge, because strong teams scale through alignment and collaboration. I’m excited to bring this mindset to a role where execution and communication both matter.",
  "I measure progress by outcomes, not activity. I focus on delivering valuable results, validating with real users or stakeholders, and iterating quickly. I’m comfortable making trade-offs, but I always communicate them clearly. I also maintain a calm, confident delivery style: steady pace, clear articulation, and minimal filler words. These habits help me contribute effectively and represent the team professionally in meetings and reviews.",
  "I enjoy taking ownership of challenging goals and turning ambiguity into a clear plan. I ask the right questions, define milestones, and maintain momentum through consistent follow-through. I communicate with confidence, keep my explanations concise, and ensure my reasoning is easy to understand. This combination of strong execution and clear communication has helped me succeed across different projects and team environments.",
];

export default function InterviewPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">Loading Interview Coach...</div>}>
      <InterviewContent />
    </Suspense>
  );
}

function InterviewContent() {
  const searchParams = useSearchParams();

  const langs = searchParams.get('langs');
  const company = searchParams.get('company');

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentParagraph, setCurrentParagraph] = useState<string>("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isFocusLost, setIsFocusLost] = useState(false);
  const [focusMessage, setFocusMessage] = useState<string>("");
  
  // Real-time Metrics
  const [metrics, setMetrics] = useState({
    confidence: 0,
    speed: 0, // words per minute
    pauses: 0,
    fillers: 0,
    energy: 0,
    focusScore: 100,
  });

  type SpeechRecognitionResultAlternativeLike = {
    transcript: string;
    confidence: number;
  };

  type SpeechRecognitionResultLike = {
    isFinal: boolean;
    0: SpeechRecognitionResultAlternativeLike;
    length: number;
  };

  type SpeechRecognitionEventLike = {
    resultIndex: number;
    results: ArrayLike<SpeechRecognitionResultLike>;
  };

  type SpeechRecognitionErrorEventLike = {
    error: string;
  };

  type SpeechRecognitionInstance = {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onstart: (() => void) | null;
    onresult: ((event: SpeechRecognitionEventLike) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
    onend: (() => void) | null;
    start: () => void;
    stop: () => void;
  };

  type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const faceMeshRef = useRef<unknown>(null);
  const cameraRef = useRef<unknown>(null);
  const lastFocusWarningRef = useRef<number>(0);

  // Use refs to keep track of the latest state/functions for callbacks
  const latestStateRef = useRef({ 
    currentParagraph, 
    metrics, 
    feedback, 
    isCompleted, 
    langs, 
    company,
    isCameraOn,
    isFocusLost,
    focusMessage,
    isLoading
  });

  useEffect(() => {
    latestStateRef.current = { 
      currentParagraph, 
      metrics, 
      feedback, 
      isCompleted, 
      langs, 
      company, 
      isCameraOn,
      isFocusLost,
      focusMessage,
      isLoading
    };
  });

  const getRandomParagraph = (exclude?: string) => {
    const pool = PRACTICE_PARAGRAPHS.filter(p => p !== exclude);
    const list = pool.length > 0 ? pool : PRACTICE_PARAGRAPHS;
    return list[Math.floor(Math.random() * list.length)] ?? "";
  };

  const resetPracticeState = () => {
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    setFeedback(null);
    setIsCompleted(false);
    setIsFocusLost(false);
    setFocusMessage("");
    setInterimTranscript("");
    accumulatedTranscriptRef.current = "";
    latestTranscriptRef.current = "";
    startTimeRef.current = 0;
    lastFocusWarningRef.current = 0;
    setMetrics({
      confidence: 0,
      speed: 0,
      pauses: 0,
      fillers: 0,
      energy: 0,
      focusScore: 100,
    });
  };

  const loadRandomParagraph = ({ speakIntro = false } = {}) => {
    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {
      }
    }

    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    resetPracticeState();

    const p = getRandomParagraph(currentParagraph);
    setCurrentParagraph(p);
    
    if (speakIntro) {
      speak(`I've prepared a new paragraph for you. Please read it aloud when you're ready.`);
    }
  };

  // Camera & Audio Analysis Setup
  useEffect(() => {
    let stream: MediaStream | null = null;

    const startAudioAnalysis = async (mediaStream: MediaStream) => {
      try {
        // Setup Audio Analysis
        if (!audioContextRef.current) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        const audioContext = audioContextRef.current;
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }

        const source = audioContext.createMediaStreamSource(mediaStream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        
        analyserRef.current = analyser;
        dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
        
        const analyzeAudio = () => {
          if (!analyserRef.current || !dataArrayRef.current) return;
      
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          analyserRef.current.getByteFrequencyData(dataArrayRef.current as any);
          
          // Calculate average volume (energy)
          const average = dataArrayRef.current.reduce((a, b) => a + b, 0) / dataArrayRef.current.length;
          const normalizedEnergy = Math.min(average / 128, 1); // 0 to 1
      
          setMetrics(prev => {
              let newConfidence = prev.confidence;
              if (normalizedEnergy > 0.1) {
                  // Boost confidence if speaking loudly/clearly
                  newConfidence = Math.min(prev.confidence + 0.005, 1.0);
              }
              
              return {
                  ...prev,
                  energy: normalizedEnergy,
                  confidence: newConfidence
              };
          });
      
          animationFrameRef.current = requestAnimationFrame(analyzeAudio);
        };

        analyzeAudio();
      } catch (err) {
        console.error("Audio analysis setup failed:", err);
      }
    };

    const startCamera = async () => {
      if (isCameraOn && videoRef.current) {
        try {
          // We only need to request audio here if MediaPipe Camera utility doesn't handle it
          // Actually, let's request both and give the stream to videoRef
          // MediaPipe Camera will use the videoRef.current
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
            audio: true 
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play().catch(e => console.error("Play error:", e));
            };
          }

          await startAudioAnalysis(stream);

        } catch (err) {
          console.error("Camera access denied:", err);
          setIsCameraOn(false);
          alert("Could not access camera/microphone. Please check permissions.");
        }
      }
    };

    const stopCamera = () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };

    if (isCameraOn) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isCameraOn]);

  // Initialize Skilled Builder Session
  const initInterview = async () => {
    setIsLoading(true);
    try {
      let role = "General Professional";
      
      if (langs || company) {
        role = `${langs ? langs : 'Professional'}${company ? ` at ${company}` : ''}`;
      }

      loadRandomParagraph({ speakIntro: true });

      try {
        const paragraph = await startInterview(role, true);
        if (paragraph) {
          setCurrentParagraph(paragraph);
        }
      } catch {
      }
    } catch (error) {
      console.error('Failed to start session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetInterview = () => {
    if (window.confirm("Are you sure you want to restart the interview? All progress will be lost.")) {
      window.speechSynthesis.cancel();
      resetPracticeState();
      initInterview();
    }
  };

  useEffect(() => {
    if (isFocusLost && focusMessage && !isMuted && isCameraOn) {
      const now = Date.now();
      // Only speak every 5 seconds to avoid spamming
      if (now - lastFocusWarningRef.current > 5000) {
        const utterance = new SpeechSynthesisUtterance(focusMessage);
        utterance.rate = 1;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
        lastFocusWarningRef.current = now;
      }
    }
  }, [isFocusLost, focusMessage, isMuted, isCameraOn]);

  useEffect(() => {
    initInterview();
    setupSpeechRecognition();
    setupFocusTracker();

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (cameraRef.current) (cameraRef.current as any).stop();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (faceMeshRef.current) (faceMeshRef.current as any).close();
      window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setupFocusTracker = async () => {
    if (typeof window === 'undefined' || !videoRef.current) return;

    try {
      console.log("Initializing focus tracker...");
      const faceMeshModule = await import('@mediapipe/face_mesh');

      // Handle different export patterns
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const FaceMesh = faceMeshModule.FaceMesh || (faceMeshModule as any).default?.FaceMesh || (faceMeshModule as any).default;

      if (!FaceMesh) {
        throw new Error("Failed to load FaceMesh from MediaPipe modules");
      }

      const faceMesh = new FaceMesh({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      faceMesh.onResults((results: { multiFaceLandmarks: any[] }) => {
        const { isCameraOn } = latestStateRef.current;
        if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
          if (isCameraOn) {
            setIsFocusLost(true);
            setFocusMessage("No face detected! Please look at the camera.");
            setMetrics(prev => ({ ...prev, focusScore: Math.max(0, prev.focusScore - 1) }));
          }
          return;
        }

        const landmarks = results.multiFaceLandmarks[0];
        
        // Simple gaze/head pose estimation
        const nose = landmarks[1];
        const leftEye = landmarks[33];
        const rightEye = landmarks[263];

        const eyeMidpointX = (leftEye.x + rightEye.x) / 2;
        const faceTurnThreshold = 0.08; // Slightly less sensitive

        const horizontalDiff = nose.x - eyeMidpointX;
        
        if (Math.abs(horizontalDiff) > faceTurnThreshold) {
          setIsFocusLost(true);
          setFocusMessage(horizontalDiff > 0 ? "You're looking too far right!" : "You're looking too far left!");
          setMetrics(prev => ({ ...prev, focusScore: Math.max(0, prev.focusScore - 0.5) }));
        } else {
          // Check iris position
          const leftIris = landmarks[468];
          const leftIrisRelativeX = (leftIris.x - leftEye.x) / (landmarks[133].x - landmarks[33].x);
          const gazeThreshold = 0.2; // Slightly less sensitive
          
          if (leftIrisRelativeX < (0.5 - gazeThreshold) || leftIrisRelativeX > (0.5 + gazeThreshold)) {
            setIsFocusLost(true);
            setFocusMessage("Please focus your eyes on the screen.");
            setMetrics(prev => ({ ...prev, focusScore: Math.max(0, prev.focusScore - 0.2) }));
          } else {
            setIsFocusLost(false);
            setFocusMessage("");
            setMetrics(prev => ({ ...prev, focusScore: Math.min(100, prev.focusScore + 0.1) }));
          }
        }
      });

      faceMeshRef.current = faceMesh;

      const processFrame = async () => {
        const { isCameraOn } = latestStateRef.current;
        if (videoRef.current && isCameraOn && videoRef.current.readyState >= 2) {
          try {
            await faceMesh.send({ image: videoRef.current });
          } catch (e) {
            console.error("FaceMesh send error:", e);
          }
        }
        // Run focus tracker at 10fps to save battery/CPU
        setTimeout(() => requestAnimationFrame(processFrame), 100);
      };

      processFrame();

    } catch (error) {
      console.error("Focus tracker initialization failed:", error);
    }
  };

  const handleUserResponseRef = useRef<((text: string) => Promise<void>) | null>(null);
  useEffect(() => {
    handleUserResponseRef.current = handleUserResponse;
  });

  const manualStopRef = useRef(false);
  const accumulatedTranscriptRef = useRef("");
  const latestTranscriptRef = useRef("");

  const setupSpeechRecognition = () => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionConstructor =
        (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition ??
        (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition;

      if (SpeechRecognitionConstructor) {
        recognitionRef.current = new SpeechRecognitionConstructor() as unknown as SpeechRecognitionInstance;
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = typeof navigator !== 'undefined' ? navigator.language : 'en-US';

        recognitionRef.current.onstart = () => {
          setIsListening(true);
          startTimeRef.current = Date.now();
        };

        recognitionRef.current.onresult = (event: SpeechRecognitionEventLike) => {
          let currentSessionTranscript = '';
          let currentConfidence = 0;

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const segment = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              accumulatedTranscriptRef.current += segment + ' ';
              currentConfidence = event.results[i][0].confidence;
            } else {
              currentSessionTranscript += segment;
            }
          }

          const fullTranscript = (accumulatedTranscriptRef.current + currentSessionTranscript).trim();
          latestTranscriptRef.current = fullTranscript;
          
          if (fullTranscript) {
            setInterimTranscript(fullTranscript);
            
            // Calculate Metrics based on the full accumulated transcript
            const words = fullTranscript.split(/\s+/);
            const wordCount = words.length;
            const durationMinutes = (Date.now() - startTimeRef.current) / 60000;
            const speed = Math.round(wordCount / (durationMinutes || 1));
            
            // Detect fillers in the full transcript
            const fillers = (fullTranscript.match(/uhh|umm|uh|um|like|you know/gi) || []).length;
            
            // Handle Pauses
            if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
            pauseTimeoutRef.current = setTimeout(() => {
              setMetrics(prev => ({ ...prev, pauses: prev.pauses + 1 }));
            }, 2000);

            setMetrics(prev => ({
              ...prev,
              confidence: currentConfidence || prev.confidence,
              speed: speed > 200 ? 200 : speed, // Cap at 200 WPM
              fillers: fillers
            }));
          }
        };

        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEventLike) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          
          if (event.error === 'network') {
            alert('Speech recognition failed due to a network error. This is often caused by a poor internet connection or browser restrictions. Please ensure you are using a stable connection and a modern browser like Chrome.');
          } else if (event.error === 'not-allowed') {
            alert('Microphone access denied. Please enable microphone permissions in your browser settings to use the AI interviewer.');
          } else if (event.error === 'no-speech') {
            // Silently handle no speech detected
            console.log('No speech detected.');
          } else {
            console.warn(`Recognition error: ${event.error}`);
          }
        };

        recognitionRef.current.onend = () => {
          // If browser stopped recognition but user didn't click stop, restart it
          // This prevents "automatic stop" on mobile during long pauses
          if (!manualStopRef.current && isListening) {
            try {
              recognitionRef.current?.start();
            } catch {
              setIsListening(false);
            }
          } else {
            setIsListening(false);
          }
        };
      } else {
        console.error('Speech recognition not supported in this browser.');
      }
    }
  };

  const toggleListening = () => {
    if (isListening) {
      manualStopRef.current = true;
      try {
        recognitionRef.current?.stop();
        
        // On mobile, speechSynthesis.speak() MUST be triggered directly by a user click
        // We "unlock" the audio here by speaking an empty string immediately
        const unlockUtterance = new SpeechSynthesisUtterance("");
        window.speechSynthesis.speak(unlockUtterance);

        // Use the Ref instead of state to get the absolute latest text
        const finalTranscript = latestTranscriptRef.current.trim();
        if (finalTranscript) {
          handleUserResponseRef.current?.(finalTranscript);
        } else {
          console.warn("No transcript detected at stop.");
          setIsListening(false);
          setFeedback("I couldn't hear any speech. Please try reading the paragraph again.");
          speak("I couldn't hear any speech. Please try reading the paragraph again.");
        }
      } catch (e) {
        console.error('Error stopping recognition:', e);
        setIsListening(false);
      }
    } else {
      manualStopRef.current = false;
      accumulatedTranscriptRef.current = "";
      latestTranscriptRef.current = "";
      setInterimTranscript("");
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      
      // Reset practice state for a new attempt on the same paragraph
      // but keep the current paragraph
      setFeedback(null);
      setIsCompleted(false);
      setIsFocusLost(false);
      setFocusMessage("");
      startTimeRef.current = Date.now();
      setMetrics({
        confidence: 0,
        speed: 0,
        pauses: 0,
        fillers: 0,
        energy: 0,
        focusScore: 100,
      });

      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error('Error starting recognition:', e);
        alert('Could not start speech recognition. Please try refreshing the page.');
        setIsListening(false);
      }
    }
  };

  const speak = (text: string) => {
    if (isMuted) return;
    
    // Clean text from markers
    const cleanText = text.replace(/FEEDBACK:|NEXT_QUESTION:/g, '').trim();
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const handleUserResponse = async (text: string) => {
    const { currentParagraph, isCompleted, feedback, isLoading: alreadyLoading } = latestStateRef.current;
    
    // Check if we already processed this or if it's too short
    const words = text.trim().split(/\s+/);
    const isTooShort = words.length < 2 && text.length < 10;
    
    if (isTooShort || isCompleted || alreadyLoading) {
      console.log("Skipping response processing:", { wordCount: words.length, charCount: text.length, isCompleted, alreadyLoading });
      if (isTooShort && !alreadyLoading && !isCompleted) {
        setFeedback("I couldn't hear enough clearly. Please try reading the paragraph again with a steady voice.");
        speak("I couldn't hear enough clearly. Please try reading the paragraph again with a steady voice.");
      }
      return;
    }
    
    setIsLoading(true);
    setFeedback(null); // Clear any previous errors/feedback
    // Ensure we reset interim to prevent double triggers
    setInterimTranscript("");
    accumulatedTranscriptRef.current = "";
    latestTranscriptRef.current = "";

    try {
      console.log("Sending to coach API...");
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paragraph: currentParagraph,
          transcript: text,
          metrics: {
            speed: metrics.speed,
            confidence: metrics.confidence,
            fillers: metrics.fillers,
            pauses: metrics.pauses,
            energy: metrics.energy,
            focusScore: metrics.focusScore,
          },
          context: { langs, company },
          previousFeedback: feedback,
        }),
      });

      let aiFeedback = "";
      if (res.ok) {
        const data = (await res.json()) as { feedback?: string };
        aiFeedback = (data.feedback || "").trim();
      } else {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
        console.error('API Coach Error:', errorData);
        
        if (res.status === 401) {
          aiFeedback = "ERROR: API Key is invalid. Please update OPENROUTER_API_KEY in Vercel Settings.";
        } else if (res.status === 500 && (errorData.error?.includes("OPENROUTER_API_KEY") || errorData.message?.includes("OPENROUTER_API_KEY") || errorData.error?.includes("missing"))) {
          aiFeedback = "ERROR: OPENROUTER_API_KEY is missing from Vercel Environment Variables. The AI cannot generate feedback without this key.";
        } else {
          aiFeedback = `AI Error: ${errorData.error || errorData.message || "The AI service is currently unavailable. Please check your internet and API keys."}`;
        }
      }

      if (!aiFeedback) {
        aiFeedback = "Good effort. Try another attempt and focus on steady pace, fewer fillers, and clearer articulation.";
      }

      const nextStep = "Tap New Random for another paragraph, or record again to improve this one.";

      setFeedback(aiFeedback);
      setIsCompleted(true);
      
      speak(`${aiFeedback}. ${nextStep}`);
    } catch (error: any) {
      console.error('Session step failed:', error);
      const errorMsg = `Network or System Error: ${error.message || "Could not reach the AI service. Please check your internet connection."}`;
      setFeedback(errorMsg);
      setIsCompleted(true);
      speak(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 overflow-y-auto">
      <div className="max-w-[1600px] mx-auto p-4 lg:p-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 shrink-0">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="p-3 rounded-2xl hover:bg-slate-50 border border-slate-100 transition-all group"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:-translate-x-1 transition-all" />
            </Link>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Communication<span className="text-blue-600">Coach</span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Session</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={resetInterview}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-slate-600 hover:bg-rose-50 hover:border-rose-100 hover:text-rose-600 transition-all font-bold text-sm"
              title="Reset Session"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset Session</span>
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3 rounded-2xl border transition-all ${
                isMuted 
                ? 'bg-rose-50 border-rose-100 text-rose-600' 
                : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-blue-600 hover:border-blue-100'
              }`}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <button
              onClick={resetInterview}
              className="px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-200"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Metrics & Practice Content */}
          <div className="lg:col-span-8 space-y-8 h-full">
            
            {/* Real-time Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Confidence', value: `${Math.round(metrics.confidence * 100)}%`, icon: Award, color: 'text-amber-500', bg: 'bg-amber-50' },
                { label: 'Pace (WPM)', value: metrics.speed, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Fillers', value: metrics.fillers, icon: MessageSquare, color: 'text-rose-500', bg: 'bg-rose-50' },
                { label: 'Focus Score', value: `${Math.round(metrics.focusScore)}%`, icon: Sparkles, color: 'text-emerald-500', bg: 'bg-emerald-50' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className={`w-10 h-10 ${stat.bg} rounded-2xl flex items-center justify-center mb-3`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-xl font-black text-slate-900">{stat.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Practice Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px] flex flex-col"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900">Current Prompt</h3>
                </div>
                <button
                  onClick={() => loadRandomParagraph()}
                  className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 transition-all text-slate-400 hover:text-blue-600"
                  title="New Prompt"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-10 flex-grow relative">
                {isLoading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/80 backdrop-blur-sm z-10">
                    <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Generating AI Prompt...</p>
                  </div>
                ) : null}
                
                <p className="text-2xl md:text-3xl font-medium leading-relaxed text-slate-700 tracking-tight">
                  {currentParagraph}
                </p>

                {isLoading && !isListening && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-12 p-8 rounded-[2rem] bg-slate-50 border border-slate-100 flex flex-col items-center justify-center gap-4"
                  >
                    <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">AI is analyzing your delivery...</p>
                  </motion.div>
                )}

                {isCompleted && feedback && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-12 p-8 rounded-[2rem] border ${
                      feedback.startsWith("ERROR") || feedback.startsWith("AI Error") || feedback.startsWith("Network")
                      ? "bg-rose-50 border-rose-100" 
                      : "bg-blue-50 border-blue-100"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white ${
                        feedback.startsWith("ERROR") || feedback.startsWith("AI Error") || feedback.startsWith("Network")
                        ? "bg-rose-600" 
                        : "bg-blue-600"
                      }`}>
                        {feedback.startsWith("ERROR") || feedback.startsWith("AI Error") || feedback.startsWith("Network") 
                          ? <AlertCircle className="w-4 h-4" /> 
                          : <Award className="w-4 h-4" />
                        }
                      </div>
                      <h4 className={`font-bold ${
                        feedback.startsWith("ERROR") || feedback.startsWith("AI Error") || feedback.startsWith("Network")
                        ? "text-rose-900" 
                        : "text-blue-900"
                      }`}>
                        {feedback.startsWith("ERROR") || feedback.startsWith("AI Error") || feedback.startsWith("Network")
                          ? "System Message" 
                          : "Expert Feedback"
                        }
                      </h4>
                    </div>
                    <p className={`leading-relaxed font-medium ${
                      feedback.startsWith("ERROR") || feedback.startsWith("AI Error") || feedback.startsWith("Network")
                      ? "text-rose-800" 
                      : "text-blue-800"
                    }`}>
                      {feedback}
                    </p>
                    {feedback.includes("OPENROUTER_API_KEY") && (
                      <div className="mt-4 p-4 bg-white/50 rounded-xl border border-rose-200 text-sm text-rose-700">
                        <strong>How to fix:</strong> Go to your Vercel Dashboard → Project Settings → Environment Variables. Add <code>OPENROUTER_API_KEY</code> with your key from OpenRouter.ai, then redeploy the project.
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              <div className="p-8 bg-slate-50/30 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {isListening ? 'Listening & Analyzing...' : 'Ready to start'}
                  </p>
                </div>

                <button
                  onClick={toggleListening}
                  disabled={isLoading || isSpeaking}
                  className={`w-full sm:w-auto px-10 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-4 shadow-xl active:scale-95 ${
                    isLoading
                    ? 'bg-slate-400 cursor-not-allowed text-white shadow-none'
                    : isListening 
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : isListening ? (
                    <>
                      <MicOff className="w-5 h-5" />
                      <span>Stop Session</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5" />
                      <span>Start Reading</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Camera & Live Feedback */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Camera Window */}
            <div className="relative aspect-video rounded-[2.5rem] bg-slate-900 overflow-hidden shadow-2xl border-4 border-white">
              <AnimatePresence>
                {!isCameraOn && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 bg-slate-100 flex flex-col items-center justify-center gap-4"
                  >
                    <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center">
                      <VideoOff className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Camera is Off</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transition-opacity duration-700 ${isCameraOn ? 'opacity-100' : 'opacity-0'}`}
              />

              {/* Energy/Volume Meter Overlay */}
              <div className="absolute bottom-6 left-6 right-6 z-10">
                <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden backdrop-blur-md">
                  <motion.div 
                    className="h-full bg-blue-400"
                    animate={{ width: `${metrics.energy * 100}%` }}
                    transition={{ type: 'spring', bounce: 0, duration: 0.1 }}
                  />
                </div>
              </div>

              {/* Focus Warning Overlay */}
              <AnimatePresence>
                {isFocusLost && isCameraOn && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute inset-0 z-30 flex items-center justify-center p-6"
                  >
                    <div className="absolute inset-0 bg-rose-500/10 backdrop-blur-[2px] border-4 border-rose-500/50 rounded-[2rem]" />
                    <div className="relative bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-rose-100 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-rose-500 flex items-center justify-center text-white animate-bounce shadow-lg shadow-rose-200">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-rose-500 uppercase tracking-widest mb-1">Attention Required</p>
                        <p className="text-slate-900 font-bold leading-tight">{focusMessage}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Camera Controls Overlay */}
              <div className="absolute top-6 right-6 z-20">
                <button
                  onClick={() => setIsCameraOn(!isCameraOn)}
                  className="p-3 rounded-2xl bg-white/90 backdrop-blur-xl border border-white shadow-xl text-slate-900 hover:bg-white transition-all"
                >
                  {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* AI Assistant Personality / Status */}
            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Real-time Coach</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Monitoring</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                {isListening 
                  ? "I'm currently analyzing your speech patterns, body language, and focus. Maintain eye contact and keep a steady pace." 
                  : "Click the start button when you're ready. I'll provide feedback on your delivery once you finish reading."}
              </p>
            </div>

            {/* Live Transcript Display */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Live Transcript</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Voice to Text</p>
                </div>
              </div>
              <div className="min-h-[120px] p-6 rounded-3xl bg-slate-50 border border-slate-100">
                <p className="text-slate-600 font-medium leading-relaxed italic">
                  {interimTranscript || (isListening ? "Listening..." : "Your live speech will appear here as you read...")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Completion Modal removed */}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}
