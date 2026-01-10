import { Question } from '@/lib/questions';

export const tcsQuestions: Question[] = [
  {
    id: 'tcs1',
    category: 'company',
    topic: 'TCS',
    question: 'A sum of money at simple interest amounts to Rs. 815 in 3 years and to Rs. 854 in 4 years. The sum is:',
    options: ['Rs. 650', 'Rs. 690', 'Rs. 698', 'Rs. 700'],
    correctAnswer: 2,
    explanation: 'Interest for 1 year = 854 - 815 = 39. Interest for 3 years = 39 * 3 = 117. Sum = 815 - 117 = 698.'
  }
];
