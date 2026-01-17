import type { Question } from "@/lib/questions";

const openRouterKey = process.env.OPENROUTER_API_KEY;

export async function startInterview(role: string, isParagraph: boolean = false) {
  if (!openRouterKey) {
    console.error("OpenRouter API key is missing. Please set OPENROUTER_API_KEY in your environment.");
    if (isParagraph) {
      return "I am a highly motivated professional with a strong background in technical problem-solving and cross-functional collaboration. Throughout my career, I have consistently demonstrated a commitment to excellence and a proactive approach to challenges. My ability to adapt to new environments and master complex systems has allowed me to deliver high-quality results consistently. I am eager to bring my expertise and passion for innovation to your team, contributing to the continued success and growth of the organization while further developing my professional skills.";
    }
    return "Hello! I am your AI Technical Interviewer. I will be evaluating your skills for this position today. To begin our session, may I have your name?";
  }
  try {
    const systemPrompt = isParagraph 
      ? `You are an expert Professional Communication Coach. 
         Generate a professional, high-level interview response paragraph for a ${role} position. 
         The paragraph should be between 60-100 words.
         It should sound professional, confident, and include some industry-specific terminology.
         STRICT RULE: NO MARKDOWN. NO BOLDING. NO ASTERISKS. PLAIN TEXT ONLY.`
      : `You are a sophisticated, elite technical interviewer for ${role} positions. 
         Your persona: Professional, highly intelligent, encouraging, but rigorous.
         Your goal: Conduct a structured technical assessment that feels like a real conversation.
         CRITICAL RULES: 
         1. NO MARKDOWN: Never use asterisks, bolding, or special formatting. Use plain text only.
         2. FLOW: Start by introducing yourself and asking for the candidate's name.
         3. ADAPTIVE: Be warm and welcoming. Use the candidate's name once you have it.`;

    const prompt = isParagraph
      ? `Provide a professional interview response paragraph that a candidate for a ${role} role would read out loud to practice their delivery.`
      : `Initiate a high-level technical interview for a ${role} position. 
         Begin with a professional greeting, introduce your role as an AI evaluator, and ask for the candidate's name to begin the session.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterKey}`,
        "Content-Type": "application/json",
        "X-Title": "AptiVerse",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
      })
    });

    if (!response.ok) throw new Error("OpenRouter API failed");
    const data = await response.json();
    let text = data.choices?.[0]?.message?.content || "";
    text = text.replace(/<think>[\s\S]*?<\/think>/g, '').replace(/\*/g, '').trim();
    return text;
  } catch (error) {
    console.error("Error starting interview:", error);
    if (isParagraph) {
      return "I am a highly motivated professional with a strong background in technical problem-solving and cross-functional collaboration. Throughout my career, I have consistently demonstrated a commitment to excellence and a proactive approach to challenges. My ability to adapt to new environments and master complex systems has allowed me to deliver high-quality results consistently. I am eager to bring my expertise and passion for innovation to your team, contributing to the continued success and growth of the organization while further developing my professional skills.";
    }
    return "Hello! I am your AI Technical Interviewer. I will be evaluating your skills for this position today. To begin our session, may I have your name?";
  }
}

export async function processInterviewStep(
  history: { role: 'user' | 'model', parts: { text: string }[] }[],
  technicalQuestions?: Question[],
  metrics?: { confidence: number }
) {
  if (!openRouterKey) {
    console.error("OpenRouter API key is missing. Please set OPENROUTER_API_KEY in your environment.");
    return "FEEDBACK: I'm currently unable to provide real-time feedback due to a missing API key. However, please continue your practice!\nNEXT_QUESTION: Let's move to the next part of our assessment.";
  }
  try {
    const systemInstruction = `You are an elite Technical AI Interviewer. You are conducting a structured assessment that analyzes both technical accuracy and candidate confidence.
        
        CONFIDENCE ANALYSIS RULES:
        1. You will receive a "Speech Confidence Score" (0.0 to 1.0) with each user response.
        2. High Confidence (>0.85): Acknowledge their clarity and directness.
        3. Moderate Confidence (0.70-0.85): Suggest they sound a bit hesitant but correct.
        4. Low Confidence (<0.70): Provide encouragement and suggest they speak more firmly.
        
        INTERVIEW ARCHITECTURE:
        Phase 1: Rapport - Greet by name and explain the process.
        Phase 2: Technical Evaluation - Ask multiple-choice questions one by one.
        
        STRICT EVALUATION PROTOCOL:
        1. When a candidate answers:
           - Analyze technical correctness against the bank.
           - Analyze their "Confidence Score".
           - Provide feedback that combines technical accuracy AND communication style.
           
        2. COMMUNICATION STYLE:
           - Plain text ONLY. No markdown.
           - Format every response as:
             FEEDBACK: [Analysis of technical answer + Analysis of their voice confidence/delivery]
             NEXT_QUESTION: [Next question + options]`;

    const formattedMessages = history.map(h => ({
      role: h.role === 'model' ? 'assistant' : 'user',
      content: h.parts[0].text
    }));

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterKey}`,
        "Content-Type": "application/json",
        "X-Title": "AptiVerse",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1",
        messages: [
          { role: "system", content: systemInstruction },
          ...formattedMessages
        ],
        temperature: 0.7,
      })
    });

    if (!response.ok) throw new Error("OpenRouter API failed");
    const data = await response.json();
    let text = data.choices?.[0]?.message?.content || "";
    text = text.replace(/<think>[\s\S]*?<\/think>/g, '').replace(/\*/g, '').trim();
    return text;
  } catch (error) {
    console.error("Error processing interview step:", error);
    return "FEEDBACK: I encountered an error processing your response. Please try again.\nNEXT_QUESTION: Can you repeat your last point?";
  }
}

export async function reviewGoCode(code: string) {
  if (!openRouterKey) return "ERROR: OPENROUTER_API_KEY is missing.";
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterKey}`,
        "Content-Type": "application/json",
        "X-Title": "AptiVerse",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1",
        messages: [
          { role: "system", content: "You are an expert Go developer. Review the following code for bugs, performance issues, and idiomatic Go practices." },
          { role: "user", content: `Review this Go code:\n\n${code}` }
        ],
        temperature: 0.7,
      })
    });

    if (!response.ok) throw new Error("OpenRouter API failed");
    const data = await response.json();
    let text = data.choices?.[0]?.message?.content || "";
    text = text.replace(/<think>[\s\S]*?<\/think>/g, '').replace(/\*/g, '').trim();
    return text;
  } catch (error) {
    return "ERROR: Failed to review code.";
  }
}

export async function getAptitudeExplanation(question: string, correctAnswer: string, userAnswer: string) {
  if (!openRouterKey) return "ERROR: OPENROUTER_API_KEY is missing.";
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterKey}`,
        "Content-Type": "application/json",
        "X-Title": "AptiVerse",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1",
        messages: [
          { role: "system", content: "You are a world-class Aptitude Tutor. Provide a structured, deep, and comprehensive explanation for the following question." },
          { role: "user", content: `QUESTION: ${question}\nCORRECT ANSWER: ${correctAnswer}\nSTUDENT ANSWER: ${userAnswer}\n\nProvide a step-by-step logic and why the student was wrong. Plain text only, no markdown.` }
        ],
        temperature: 0.7,
      })
    });

    if (!response.ok) throw new Error("OpenRouter API failed");
    const data = await response.json();
    let text = data.choices?.[0]?.message?.content || "";
    text = text.replace(/<think>[\s\S]*?<\/think>/g, '').replace(/\*/g, '').trim();
    return text;
  } catch (error) {
    return "ERROR: Failed to generate explanation.";
  }
}
