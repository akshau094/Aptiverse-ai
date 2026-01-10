import excelQuestions from '@/data/AptitudeTest/questions.json';
import { googleQuestions } from '@/data/AptitudeTest/companies/Google/questions';
import { amazonQuestions } from '@/data/AptitudeTest/companies/Amazon/questions';
import { microsoftQuestions } from '@/data/AptitudeTest/companies/Microsoft/questions';
import { tcsQuestions } from '@/data/AptitudeTest/companies/TCS/questions';

export interface Question {
  id: string;
  category: 'language' | 'company';
  topic: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

// Aggregated question bank from all modules
export const questionBank: Question[] = [
  ...(excelQuestions as Question[]),
  ...googleQuestions,
  ...amazonQuestions,
  ...microsoftQuestions,
  ...tcsQuestions,
];

export function getQuestions(languages: string[], company: string | null) {
  return questionBank.filter(q => 
    (q.category === 'language' && languages.includes(q.topic)) ||
    (q.category === 'company' && q.topic === company)
  );
}
