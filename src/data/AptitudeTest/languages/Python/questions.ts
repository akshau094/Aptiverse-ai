import { Question } from '@/lib/questions';

export const pythonQuestions: Question[] = [
  {
    id: 'py1',
    category: 'language',
    topic: 'Python',
    question: 'What is the output of print(0.1 + 0.2 == 0.3)?',
    options: ['True', 'False', 'Error', '0.3'],
    correctAnswer: 1,
    explanation: 'Due to floating-point precision issues in binary representation, 0.1 + 0.2 actually equals 0.30000000000000004.'
  },
  {
    id: 'py2',
    category: 'language',
    topic: 'Python',
    question: 'Which of the following is used to manage resources like file streams in Python safely?',
    options: ['try...except', 'with statement', 'finally block', 'yield keyword'],
    correctAnswer: 1,
    explanation: 'The "with" statement (context manager) ensures that resources are properly closed even if an exception occurs.'
  },
  {
    id: 'py3',
    category: 'language',
    topic: 'Python',
    question: 'What is the time complexity of searching for an element in a Python dictionary?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'],
    correctAnswer: 0,
    explanation: 'Python dictionaries are implemented using hash tables, providing average O(1) time complexity for lookups.'
  },
  {
    id: 'py4',
    category: 'language',
    topic: 'Python',
    question: 'What does the "self" keyword represent in a Python class method?',
    options: ['The class itself', 'The parent class', 'The instance of the class', 'A global variable'],
    correctAnswer: 2,
    explanation: 'Self refers to the specific instance of the class being operated upon, allowing access to its attributes.'
  },
  {
    id: 'py5',
    category: 'language',
    topic: 'Python',
    question: 'What is a decorator in Python?',
    options: ['A function that returns another function', 'A way to style code', 'A built-in class', 'A type of loop'],
    correctAnswer: 0,
    explanation: 'Decorators are functions that modify the behavior of another function without changing its source code.'
  }
];
