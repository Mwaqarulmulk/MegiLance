// @AI-HINT: Mock Service Worker (MSW) setup for API mocking in tests.
// This file sets up the MSW server and defines the request handlers.

import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Define request handlers
export const handlers = [
  // Mock user authentication
  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      user: {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'freelancer',
      },
      token: 'fake-jwt-token',
    });
  }),
  
  http.post('/api/auth/register', () => {
    return HttpResponse.json({
      user: {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'client',
      },
      token: 'fake-jwt-token',
    });
  }),
  
  // Mock user profile
  http.get('/api/user/profile', () => {
    return HttpResponse.json({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'freelancer',
      avatar: '/path/to/avatar.jpg',
      bio: 'Experienced developer with 5+ years in web technologies',
      skills: ['React', 'Node.js', 'TypeScript'],
      rating: 4.8,
      completedProjects: 24,
    });
  }),
  
  // Mock projects
  http.get('/api/projects', () => {
    return HttpResponse.json([
      {
        id: 1,
        title: 'Build a responsive website',
        description: 'Need a developer to build a responsive website using React',
        budget: { min: 500, max: 1000 },
        deadline: '2025-10-15',
        skills: ['React', 'CSS', 'JavaScript'],
        postedBy: {
          id: 10,
          name: 'Alice Johnson',
          avatar: '/path/to/alice.jpg',
        },
        postedAt: '2025-09-20',
        proposals: 12,
      },
      {
        id: 2,
        title: 'Mobile app development',
        description: 'Looking for a React Native developer to build a mobile app',
        budget: { min: 2000, max: 5000 },
        deadline: '2025-11-30',
        skills: ['React Native', 'JavaScript', 'Mobile'],
        postedBy: {
          id: 11,
          name: 'Bob Williams',
          avatar: '/path/to/bob.jpg',
        },
        postedAt: '2025-09-22',
        proposals: 8,
      },
    ]);
  }),
  
  // Mock messages
  http.get('/api/messages', () => {
    return HttpResponse.json([
      {
        id: 1,
        contactName: 'Alice Johnson',
        lastMessage: 'Hey, are we still on for lunch tomorrow?',
        lastMessageTimestamp: '10:30 AM',
        unreadCount: 1,
        avatar: '/path/to/alice.png',
      },
      {
        id: 2,
        contactName: 'Bob Williams',
        lastMessage: 'Thanks for the quick turnaround!',
        lastMessageTimestamp: 'Yesterday',
        unreadCount: 0,
        avatar: '/path/to/bob.png',
      },
    ]);
  }),
  
  http.get('/api/messages/1', () => {
    return HttpResponse.json({
      id: 1,
      contactName: 'Alice Johnson',
      lastMessage: 'Yes, absolutely! Looking forward to it.',
      lastMessageTimestamp: '10:32 AM',
      unreadCount: 0,
      avatar: '/path/to/alice.png',
      messages: [
        { id: 101, text: 'Hey, are we still on for lunch tomorrow?', sender: 'contact', timestamp: '10:30 AM' },
        { id: 102, text: 'Yes, absolutely! Looking forward to it.', sender: 'user', timestamp: '10:32 AM' },
      ],
    });
  }),
  
  http.post('/api/messages/1', async ({ request }) => {
    const newMessage = await request.json();
    
    return HttpResponse.json({
      id: 103,
      text: newMessage.text,
      sender: 'user',
      timestamp: '10:50 AM',
    });
  }),
];

// Setup the server with the request handlers
export const server = setupServer(...handlers);