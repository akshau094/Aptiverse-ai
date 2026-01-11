import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Question } from "@/lib/questions";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function startInterview(role: string, isParagraph: boolean = false) {
  if (!apiKey) {
    console.error("Gemini API key is missing. Please set NEXT_PUBLIC_GEMINI_API_KEY in your environment.");
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

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: {
        role: "system",
        parts: [{ text: systemPrompt }]
      }
    });
    
    const prompt = isParagraph
      ? `Provide a professional interview response paragraph that a candidate for a ${role} role would read out loud to practice their delivery.`
      : `Initiate a high-level technical interview for a ${role} position. 
         Begin with a professional greeting, introduce your role as an AI evaluator, and ask for the candidate's name to begin the session.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });
    const response = await result.response;
    return response.text().replace(/\*/g, '').trim();
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
  if (!apiKey) {
    console.error("Gemini API key is missing. Please set NEXT_PUBLIC_GEMINI_API_KEY in your environment.");
    return "FEEDBACK: I'm currently unable to provide real-time feedback due to a missing API key. However, please continue your practice!\nNEXT_QUESTION: Let's move to the next part of our assessment.";
  }
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: {
        role: "system",
        parts: [{ text: `You are an elite Technical AI Interviewer. You are conducting a structured assessment that analyzes both technical accuracy and candidate confidence.
        
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
             NEXT_QUESTION: [Next question + options]` }]
      }
    });
    
    const chat = model.startChat({
      history: history.slice(0, -1),
    });

    const lastUserMessage = history[history.length - 1].parts[0].text;
    const userMessages = history.filter(m => m.role === 'user');
    const interactionCount = userMessages.length;

    // Determine current progress
    const modelMessagesWithQuestions = history.filter(m => m.role === 'model' && m.parts[0].text.includes("NEXT_QUESTION"));
    const currentQuestionIndex = modelMessagesWithQuestions.length;

    let prompt = "";
    
    if (interactionCount === 1) {
      // Phase 1: Greet and start Phase 2
      const firstQuestion = technicalQuestions && technicalQuestions.length > 0 ? technicalQuestions[0] : null;
      
      prompt = `
        The candidate's name is "${lastUserMessage}".
        1. Acknowledge them warmly.
        2. Explain that you will be evaluating their technical skills and communication confidence.
        3. Transition immediately to the first technical question from the bank.
        
        FIRST QUESTION:
        ${firstQuestion ? `
        Question: ${firstQuestion.question}
        Options:
        A) ${firstQuestion.options[0]}
        B) ${firstQuestion.options[1]}
        C) ${firstQuestion.options[2]}
        D) ${firstQuestion.options[3]}
        ` : 'Ask a foundational technical question related to the role.'}
        
        Format:
        FEEDBACK: It is a pleasure to meet you, ${lastUserMessage}. I will be assessing your technical expertise and delivery today. Let's begin.
        NEXT_QUESTION: ${firstQuestion ? `${firstQuestion.question}\n\nA) ${firstQuestion.options[0]}\nB) ${firstQuestion.options[1]}\nC) ${firstQuestion.options[2]}\nD) ${firstQuestion.options[3]}` : 'Could you explain the core concepts of your primary programming language?'}
      `;
    } else {
      // Phase 2: Evaluation loop
      const prevQuestionData = technicalQuestions && currentQuestionIndex > 0 ? technicalQuestions[currentQuestionIndex - 1] : null;
      const nextQuestionData = technicalQuestions && currentQuestionIndex < technicalQuestions.length ? technicalQuestions[currentQuestionIndex] : null;

      prompt = `
        Candidate's Response: "${lastUserMessage}"
        Speech Confidence Score: ${metrics?.confidence || '0.80'}
        
        PREVIOUS QUESTION CONTEXT:
        ${prevQuestionData ? `
        Question: "${prevQuestionData.question}"
        Correct Option Index: ${prevQuestionData.correctAnswer}
        Correct Text: "${prevQuestionData.options[prevQuestionData.correctAnswer]}"
        Explanation: "${prevQuestionData.explanation}"
        ` : 'N/A'}

        NEXT QUESTION TO ASK:
        ${nextQuestionData ? `
        Question: ${nextQuestionData.question}
        Options:
        A) ${nextQuestionData.options[0]}
        B) ${nextQuestionData.options[1]}
        C) ${nextQuestionData.options[2]}
        D) ${nextQuestionData.options[3]}
        ` : 'NONE - The interview is complete.'}

        Task:
        - Evaluate the candidate's response against the previous question.
        - Provide FEEDBACK following the protocol (Correction if wrong, Insight if right).
        - Provide NEXT_QUESTION from the bank or a closing message.
      `;
    }

    const result = await chat.sendMessage([{ text: prompt }]);
    const response = await result.response;
    return response.text().replace(/\*/g, '').trim();
  } catch (error) {
    console.error("Error processing interview step:", error);
    return "FEEDBACK: I apologize, but I encountered a technical interruption. NEXT_QUESTION: Could you please repeat your last response so we can continue?";
  }
}

export async function reviewGoCode(challengeTitle: string, problemStatement: string, code: string) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: {
        role: "system",
        parts: [{ text: `You are an expert Go developer and technical interviewer. 
        Your task is to review the candidate's Go code for a specific challenge.
        Provide constructive feedback on:
        1. Correctness: Does it solve the problem?
        2. Efficiency: Time and space complexity.
        3. Go Idioms: Does it follow Go best practices?
        4. Quality: Readability and structure.
        
        Format your response in plain text without markdown or asterisks.
        Start with "FEEDBACK:" followed by your analysis.
        End with a score out of 100.` }]
      }
    });

    const prompt = `
      Challenge: ${challengeTitle}
      Problem: ${problemStatement}
      Candidate's Code:
      ${code}
    `;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });
    const response = await result.response;
    return response.text().replace(/\*/g, '').trim();
  } catch (error) {
    console.error("Error reviewing Go code:", error);
    return "FEEDBACK: I encountered an error while reviewing your code. Please try submitting again.";
  }
}

export async function getAptitudeExplanation(question: string, correctAnswer: string, userAnswer: string) {
  if (!apiKey) {
    console.error("Gemini API key is missing. Please set NEXT_PUBLIC_GEMINI_API_KEY in your environment.");
    return `The correct answer is ${correctAnswer}. (AI explanation unavailable: API key missing)`;
  }
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: {
        role: "system",
        parts: [{ text: `You are a world-class Aptitude Tutor. 
        A student just answered an aptitude question incorrectly.
        Your goal is to provide a structured, deep, and comprehensive explanation.
        
        STRICT RESPONSE STRUCTURE:
        1. THE CORRECT ANSWER: Start by clearly stating "The correct answer is [correctAnswer]".
        2. WHY IT IS RIGHT: Provide a detailed, step-by-step logical breakdown of how to reach the correct answer. Explain the concepts clearly.
        3. WHY YOUR ANSWER WAS WRONG: Analyze the student's choice [userAnswer] and explain the specific logical error, trap, or misunderstanding that leads to that wrong choice.
        
        RULES:
        - BE VERBOSE: Use at least 6-10 sentences in total.
        - SIMPLE LANGUAGE: Use clear, easy-to-understand language.
        - NO MARKDOWN: No asterisks, no bolding, no bullet points. Use plain text only.
        - SEPARATION: Use double newlines (\n\n) between the three sections.
        - TONE: Professional, encouraging, and master-level tutoring.` }]
      }
    });

    const prompt = `
      QUESTION: ${question}
      STUDENT'S WRONG CHOICE: ${userAnswer}
      ACTUAL CORRECT ANSWER: ${correctAnswer}
        
      Provide the explanation following the three-section structure exactly.
      Section 1: The correct answer.
      Section 2: Detailed logic of why the correct answer is right.
      Section 3: Analysis of why the student's choice (${userAnswer}) is incorrect.
    `;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });
    const response = await result.response;
    return response.text().replace(/\*/g, '').trim();
  } catch (error) {
    console.error("Error getting AI explanation:", error);
    return `The correct answer is ${correctAnswer}. This satisfies the logic of the question. Your choice of ${userAnswer} was incorrect because it does not follow the required pattern. Keep practicing!`;
  }
}
