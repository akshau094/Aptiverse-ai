import { Question } from '@/lib/questions';

export const javascriptQuestions: Question[] = [
  {
    id: 'js1',
    category: 'language',
    topic: 'JavaScript',
    question: 'What is "Hoisting" in JavaScript?',
    options: ['Lifting a variable to the top of its scope', 'Running code faster', 'A way to import modules', 'Debugging tool'],
    correctAnswer: 0,
    explanation: 'Hoisting is a behavior where variable and function declarations are moved to the top of their containing scope during the compilation phase.'
  },
  {
    id: 'js2',
    category: 'language',
    topic: 'JavaScript',
    question: 'What will be the output of console.log(typeof NaN)?',
    options: ['number', 'NaN', 'undefined', 'object'],
    correctAnswer: 0,
    explanation: 'Despite standing for "Not-a-Number", the type of NaN is technically "number" in JavaScript.'
  }
];
