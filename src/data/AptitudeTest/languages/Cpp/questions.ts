import { Question } from '@/lib/questions';

export const cppQuestions: Question[] = [
  {
    id: 'cpp1',
    category: 'language',
    topic: 'C++',
    question: 'What is a "Virtual Function" in C++?',
    options: ['A function that does nothing', 'A function that can be overridden in a derived class', 'A private function', 'A function that is called by value'],
    correctAnswer: 1,
    explanation: 'Virtual functions allow for dynamic dispatch, ensuring that the correct function is called for an object, regardless of the type of reference used for function call.'
  }
];
