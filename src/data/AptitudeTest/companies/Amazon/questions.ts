import { Question } from '@/lib/questions';

export const amazonQuestions: Question[] = [
  {
    id: 'amzn1',
    category: 'company',
    topic: 'Amazon',
    question: 'Amazon uses an "LRU Cache" for many services. What does LRU stand for?',
    options: ['Longest Recently Used', 'Least Recently Used', 'Linear Resource Unit', 'List Run Utility'],
    correctAnswer: 1,
    explanation: 'LRU (Least Recently Used) is a cache eviction policy that removes the oldest accessed items first.'
  },
  {
    id: 'amzn2',
    category: 'company',
    topic: 'Amazon',
    question: 'To handle massive traffic during Prime Day, which AWS service is best for horizontal scaling of compute resources?',
    options: ['S3', 'EC2 Auto Scaling', 'Lambda', 'RDS'],
    correctAnswer: 1,
    explanation: 'Auto Scaling automatically adjusts the number of EC2 instances to handle the current load.'
  },
  {
    id: 'amzn3',
    category: 'company',
    topic: 'Amazon',
    question: 'Which data structure would you use to find the "Top K" most frequently purchased items in real-time?',
    options: ['Queue', 'Min-Heap', 'Sorted Array', 'Linked List'],
    correctAnswer: 1,
    explanation: 'A Min-Heap of size K allows you to track the top K elements efficiently in O(n log k) time.'
  }
];
