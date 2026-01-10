import { Question } from '@/lib/questions';

export const javaQuestions: Question[] = [
  {
    id: 'java1',
    category: 'language',
    topic: 'Java',
    question: 'What is the purpose of the "volatile" keyword in Java?',
    options: ['To make a variable constant', 'To ensure thread-safe visibility', 'To speed up execution', 'To prevent serialization'],
    correctAnswer: 1,
    explanation: 'Volatile ensures that changes to a variable are always read from and written to main memory, ensuring visibility across threads.'
  },
  {
    id: 'java2',
    category: 'language',
    topic: 'Java',
    question: 'Which collection in Java does not allow duplicate elements?',
    options: ['ArrayList', 'LinkedList', 'HashSet', 'Vector'],
    correctAnswer: 2,
    explanation: 'HashSet implements the Set interface, which by definition contains no duplicate elements.'
  }
];
