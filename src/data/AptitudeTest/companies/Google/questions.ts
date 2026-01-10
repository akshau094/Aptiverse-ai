import { Question } from '@/lib/questions';

export const googleQuestions: Question[] = [
  {
    id: 'goog1',
    category: 'company',
    topic: 'Google',
    question: 'Given an array of integers, find the longest consecutive sequence. What is the optimal time complexity?',
    options: ['O(n log n)', 'O(n)', 'O(n^2)', 'O(log n)'],
    correctAnswer: 1,
    explanation: 'Using a Hash Set, we can check for each number if it starts a sequence in O(1), leading to an overall O(n) solution.'
  },
  {
    id: 'goog2',
    category: 'company',
    topic: 'Google',
    question: 'In a distributed system, which algorithm is commonly used to maintain consistency across nodes?',
    options: ['Dijkstra', 'Paxos/Raft', 'Binary Search', 'Quicksort'],
    correctAnswer: 1,
    explanation: 'Paxos and Raft are consensus algorithms used to ensure a group of computers can agree on a single value or state.'
  },
  {
    id: 'goog3',
    category: 'company',
    topic: 'Google',
    question: 'Which data structure is most efficient for implementing a "Type-ahead" or "Autocomplete" feature?',
    options: ['Binary Search Tree', 'Trie (Prefix Tree)', 'Hash Map', 'Stack'],
    correctAnswer: 1,
    explanation: 'A Trie allows for extremely fast prefix lookups, making it ideal for suggesting words based on characters typed.'
  },
  {
    id: 'goog4',
    category: 'company',
    topic: 'Google',
    question: 'Google often uses "MapReduce". What is the primary purpose of this framework?',
    options: ['Database storage', 'Parallel processing of large datasets', 'UI design', 'Network security'],
    correctAnswer: 1,
    explanation: 'MapReduce is designed to process massive amounts of data in parallel across thousands of machines.'
  },
  {
    id: 'goog5',
    category: 'company',
    topic: 'Google',
    question: 'In graph theory, which algorithm would you use to find the shortest path in a weighted graph with no negative edges?',
    options: ['Breadth-First Search', 'Dijkstra Algorithm', 'Depth-First Search', 'Kruskal Algorithm'],
    correctAnswer: 1,
    explanation: 'Dijkstra algorithm is the standard for finding shortest paths in non-negative weighted graphs.'
  }
];
