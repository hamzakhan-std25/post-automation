// Create a public/mockServiceWorker.js for development
// This intercepts API calls and returns mock data

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const { worker } = require('./mocks/browser');
  worker.start();
}

// Create src/mocks/handlers.js
export const handlers = [
  // Mock events API
  {
    url: '/api/events',
    method: 'GET',
    response: (req, res, ctx) => {
      return res(
        ctx.json([
          {
            id: 1,
            title: 'Annual Cultural Festival',
            description: 'Join us for a day of cultural performances and food stalls',
            date: '2024-12-15',
            location: 'Main Auditorium'
          },
          {
            id: 2,
            title: 'Tech Workshop: Web Development',
            description: 'Learn modern web development techniques',
            date: '2024-12-20',
            location: 'Computer Lab 3'
          },
          {
            id: 3,
            title: 'Sports Day',
            description: 'Annual sports competition between departments',
            date: '2024-12-22',
            location: 'University Stadium'
          }
        ])
      );
    }
  },
  
  // Mock activities API
  {
    url: '/api/activities',
    method: 'GET',
    response: (req, res, ctx) => {
      return res(
        ctx.json([
          {
            id: 1,
            title: 'Morning Yoga Club',
            description: 'Daily yoga sessions',
            time: '7:00 AM',
            days: ['Mon', 'Wed', 'Fri']
          }
        ])
      );
    }
  }
];