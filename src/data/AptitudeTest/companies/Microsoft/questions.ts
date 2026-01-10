import { Question } from '@/lib/questions';

export const microsoftQuestions: Question[] = [
  {
    id: 'msft1',
    category: 'company',
    topic: 'Microsoft',
    question: 'Which of these is a core component of Microsoft Azure for serverless computing?',
    options: ['Azure Functions', 'Virtual Machines', 'Blob Storage', 'Cosmos DB'],
    correctAnswer: 0,
    explanation: 'Azure Functions is a serverless solution that allows you to write less code and maintain less infrastructure.'
  },
  {
    id: 'msft2',
    category: 'company',
    topic: 'Microsoft',
    question: 'Microsoft developed TypeScript to address issues in which language?',
    options: ['Java', 'JavaScript', 'C#', 'Python'],
    correctAnswer: 1,
    explanation: 'TypeScript is a typed superset of JavaScript that compiles to plain JavaScript, designed for large-scale applications.'
  }
];
