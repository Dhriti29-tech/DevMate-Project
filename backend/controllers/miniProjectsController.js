// Mini-project catalog — curated per language, no DB model needed.
// Projects are static content; user submission state lives in Roadmap.miniProjectsCompleted.

const CATALOG = {
  HTML: [
    {
      id: 'html-1',
      title: 'Personal Portfolio Page',
      level: 'Beginner',
      difficulty: 'Easy',
      description: 'Build a personal portfolio using semantic HTML5 elements. Include a header, about section, skills list, and contact form.',
      requirements: ['Use semantic tags: header, main, section, footer', 'Add a navigation bar with anchor links', 'Include an unordered list of skills', 'Add a contact form with name, email, message fields'],
      expectedOutput: 'A multi-section static portfolio page with correct semantic structure.',
      estimatedTime: '2–3 hours',
    },
    {
      id: 'html-2',
      title: 'Product Landing Page',
      level: 'Beginner',
      difficulty: 'Easy',
      description: 'Create a product landing page for a fictional app. Focus on structure, headings hierarchy, and accessible markup.',
      requirements: ['Correct heading hierarchy (h1 → h2 → h3)', 'Hero section with tagline and CTA button', 'Features section with icons (use emoji)', 'Footer with links'],
      expectedOutput: 'A clean landing page with proper HTML structure and accessible markup.',
      estimatedTime: '2 hours',
    },
    {
      id: 'html-3',
      title: 'Resume / CV Page',
      level: 'Intermediate',
      difficulty: 'Medium',
      description: 'Build a full resume page using tables, lists, and semantic HTML. Should be printable.',
      requirements: ['Use a table for work experience', 'Use definition lists for skills', 'Add a print stylesheet via media query', 'Include meta tags for SEO'],
      expectedOutput: 'A structured resume page that renders well in browser and print.',
      estimatedTime: '3 hours',
    },
  ],

  CSS: [
    {
      id: 'css-1',
      title: 'Responsive Card Grid',
      level: 'Beginner',
      difficulty: 'Easy',
      description: 'Build a responsive card grid layout using CSS Flexbox. Cards should reflow on mobile.',
      requirements: ['Use flexbox with flex-wrap', 'Cards have image, title, description, button', 'Responsive: 3 cols desktop, 2 tablet, 1 mobile', 'Hover effect on cards'],
      expectedOutput: 'A responsive card grid that adapts to all screen sizes.',
      estimatedTime: '2–3 hours',
    },
    {
      id: 'css-2',
      title: 'CSS Grid Dashboard Layout',
      level: 'Intermediate',
      difficulty: 'Medium',
      description: 'Recreate a dashboard layout using CSS Grid with sidebar, header, and main content area.',
      requirements: ['Use CSS Grid with named areas', 'Sidebar collapses on mobile', 'Header spans full width', 'At least 4 stat cards in main area'],
      expectedOutput: 'A pixel-perfect dashboard shell using only CSS Grid.',
      estimatedTime: '3–4 hours',
    },
    {
      id: 'css-3',
      title: 'Animated Login Form',
      level: 'Intermediate',
      difficulty: 'Medium',
      description: 'Style a login form with floating labels, focus animations, and a loading button state.',
      requirements: ['Floating label animation on focus', 'Input border color transition', 'Button loading spinner (CSS only)', 'Error state styling'],
      expectedOutput: 'A polished login form with smooth CSS animations.',
      estimatedTime: '2–3 hours',
    },
    {
      id: 'css-4',
      title: 'Dark/Light Theme Toggle',
      level: 'Advanced',
      difficulty: 'Hard',
      description: 'Implement a full dark/light theme system using CSS custom properties and a checkbox toggle.',
      requirements: ['CSS variables for all colors', 'Toggle switch component in pure CSS', 'Smooth transition between themes', 'Persist preference using localStorage (JS allowed)'],
      expectedOutput: 'A theme-aware page that switches cleanly between dark and light modes.',
      estimatedTime: '3–4 hours',
    },
  ],

  JavaScript: [
    {
      id: 'js-1',
      title: 'Todo List App',
      level: 'Beginner',
      difficulty: 'Easy',
      description: 'Build a fully functional todo app with add, complete, delete, and filter features using vanilla JS.',
      requirements: ['Add new todos on Enter or button click', 'Mark todos as complete (toggle)', 'Delete individual todos', 'Filter: All / Active / Completed', 'Persist to localStorage'],
      expectedOutput: 'A working todo app that survives page refresh.',
      estimatedTime: '3–4 hours',
    },
    {
      id: 'js-2',
      title: 'Quiz App',
      level: 'Beginner',
      difficulty: 'Easy',
      description: 'Create a multiple-choice quiz app with score tracking and a results screen.',
      requirements: ['At least 5 questions with 4 options each', 'Highlight correct/wrong answer after selection', 'Track and display score', 'Restart quiz button'],
      expectedOutput: 'An interactive quiz that shows final score and allows restart.',
      estimatedTime: '3 hours',
    },
    {
      id: 'js-3',
      title: 'Weather App (API)',
      level: 'Intermediate',
      difficulty: 'Medium',
      description: 'Fetch live weather data from OpenWeatherMap API and display current conditions.',
      requirements: ['Search by city name', 'Display temperature, humidity, wind speed', 'Show weather icon', 'Handle API errors gracefully'],
      expectedOutput: 'A weather app that fetches and displays real data.',
      estimatedTime: '4 hours',
    },
    {
      id: 'js-4',
      title: 'Expense Tracker',
      level: 'Intermediate',
      difficulty: 'Medium',
      description: 'Build an expense tracker with income/expense entries, running balance, and localStorage persistence.',
      requirements: ['Add income and expense transactions', 'Show running balance', 'Color-code positive/negative', 'Delete transactions', 'Persist to localStorage'],
      expectedOutput: 'A functional expense tracker with persistent state.',
      estimatedTime: '4–5 hours',
    },
    {
      id: 'js-5',
      title: 'Infinite Scroll Gallery',
      level: 'Advanced',
      difficulty: 'Hard',
      description: 'Build an image gallery that loads more images as the user scrolls using the Intersection Observer API.',
      requirements: ['Use Intersection Observer (no scroll events)', 'Fetch images from Unsplash API', 'Skeleton loading placeholders', 'Lazy load images'],
      expectedOutput: 'A smooth infinite-scroll gallery with lazy loading.',
      estimatedTime: '5–6 hours',
    },
  ],

  React: [
    {
      id: 'react-1',
      title: 'Counter with useReducer',
      level: 'Beginner',
      difficulty: 'Easy',
      description: 'Build a counter app using useReducer instead of useState. Support increment, decrement, reset, and step size.',
      requirements: ['useReducer for state management', 'Increment / Decrement / Reset actions', 'Configurable step size input', 'Disable decrement below 0'],
      expectedOutput: 'A counter component demonstrating useReducer patterns.',
      estimatedTime: '1–2 hours',
    },
    {
      id: 'react-2',
      title: 'Shopping Cart with Context',
      level: 'Intermediate',
      difficulty: 'Medium',
      description: 'Build a product listing and shopping cart using React Context API for global state.',
      requirements: ['Product list page with Add to Cart', 'Cart page with quantity controls', 'Total price calculation', 'Context + useReducer for cart state', 'Item count badge on cart icon'],
      expectedOutput: 'A multi-page shopping cart app using Context API.',
      estimatedTime: '5–6 hours',
    },
    {
      id: 'react-3',
      title: 'GitHub Profile Finder',
      level: 'Intermediate',
      difficulty: 'Medium',
      description: 'Search GitHub users by username and display their profile, repos, and stats using the GitHub API.',
      requirements: ['Search input with debounce', 'Display avatar, bio, followers, repos', 'List top 5 repositories', 'Loading and error states', 'useEffect for API calls'],
      expectedOutput: 'A GitHub profile viewer with live API data.',
      estimatedTime: '4–5 hours',
    },
    {
      id: 'react-4',
      title: 'Kanban Board',
      level: 'Advanced',
      difficulty: 'Hard',
      description: 'Build a drag-and-drop Kanban board with columns: Todo, In Progress, Done.',
      requirements: ['Drag and drop cards between columns', 'Add / delete cards', 'Persist board state to localStorage', 'Column task count badges'],
      expectedOutput: 'A functional Kanban board with drag-and-drop.',
      estimatedTime: '6–8 hours',
    },
  ],

  Node: [
    {
      id: 'node-1',
      title: 'CLI File Manager',
      level: 'Beginner',
      difficulty: 'Easy',
      description: 'Build a command-line file manager using Node.js fs module. Support list, read, create, and delete operations.',
      requirements: ['List files in a directory', 'Read file contents', 'Create a new file with content', 'Delete a file', 'Use process.argv for commands'],
      expectedOutput: 'A CLI tool that manages files via terminal commands.',
      estimatedTime: '2–3 hours',
    },
    {
      id: 'node-2',
      title: 'REST API with Express',
      level: 'Intermediate',
      difficulty: 'Medium',
      description: 'Build a simple REST API for a notes app with full CRUD using in-memory storage.',
      requirements: ['GET /notes — list all notes', 'POST /notes — create note', 'PUT /notes/:id — update note', 'DELETE /notes/:id — delete note', 'Proper HTTP status codes'],
      expectedOutput: 'A working REST API testable with Postman or curl.',
      estimatedTime: '3–4 hours',
    },
    {
      id: 'node-3',
      title: 'JWT Auth System',
      level: 'Advanced',
      difficulty: 'Hard',
      description: 'Implement a complete JWT authentication system with signup, login, and protected routes.',
      requirements: ['POST /auth/signup with bcrypt hashing', 'POST /auth/login returning JWT', 'Auth middleware for protected routes', 'GET /profile (protected)', 'Token expiry handling'],
      expectedOutput: 'A secure auth API with JWT and bcrypt.',
      estimatedTime: '5–6 hours',
    },
  ],

  Express: [
    {
      id: 'express-1',
      title: 'Middleware Logger',
      level: 'Beginner',
      difficulty: 'Easy',
      description: 'Build a custom Express middleware that logs method, URL, status code, and response time for every request.',
      requirements: ['Log method, URL, timestamp', 'Measure and log response time', 'Color-code by status (2xx green, 4xx yellow, 5xx red)', 'Skip logging for /health route'],
      expectedOutput: 'A reusable logger middleware that works across all routes.',
      estimatedTime: '2 hours',
    },
    {
      id: 'express-2',
      title: 'File Upload API',
      level: 'Intermediate',
      difficulty: 'Medium',
      description: 'Build an Express API that accepts file uploads, validates type/size, and stores them locally.',
      requirements: ['POST /upload with multipart/form-data', 'Validate: only images, max 2MB', 'Store with unique filename', 'GET /files to list uploaded files', 'DELETE /files/:name to remove'],
      expectedOutput: 'A file upload API with validation and storage.',
      estimatedTime: '3–4 hours',
    },
    {
      id: 'express-3',
      title: 'Rate Limiter Middleware',
      level: 'Advanced',
      difficulty: 'Hard',
      description: 'Implement a custom rate limiter middleware without external packages. Limit requests per IP per time window.',
      requirements: ['Track requests per IP in memory', 'Configurable: max requests and window (ms)', 'Return 429 with Retry-After header when exceeded', 'Reset window after expiry', 'Test with rapid requests'],
      expectedOutput: 'A working rate limiter that blocks excessive requests.',
      estimatedTime: '4–5 hours',
    },
  ],

  MongoDB: [
    {
      id: 'mongo-1',
      title: 'User CRUD with Mongoose',
      level: 'Beginner',
      difficulty: 'Easy',
      description: 'Build a full CRUD API for users using Mongoose with validation, unique email, and timestamps.',
      requirements: ['User schema: name, email (unique), age, createdAt', 'POST /users — create with validation', 'GET /users — list with pagination', 'PUT /users/:id — update', 'DELETE /users/:id — soft delete'],
      expectedOutput: 'A Mongoose-backed user API with proper validation.',
      estimatedTime: '3–4 hours',
    },
    {
      id: 'mongo-2',
      title: 'Blog with Relationships',
      level: 'Intermediate',
      difficulty: 'Medium',
      description: 'Build a blog API with Posts and Comments using Mongoose references and populate().',
      requirements: ['Post schema with author ref to User', 'Comment schema with post ref', 'GET /posts/:id populates author and comments', 'Cascade delete comments when post deleted', 'Index on post.createdAt for sorting'],
      expectedOutput: 'A relational blog API using Mongoose populate.',
      estimatedTime: '4–5 hours',
    },
    {
      id: 'mongo-3',
      title: 'Aggregation Analytics Dashboard',
      level: 'Advanced',
      difficulty: 'Hard',
      description: 'Use MongoDB aggregation pipeline to build an analytics endpoint for an e-commerce orders collection.',
      requirements: ['Total revenue per month ($group + $project)', 'Top 5 products by sales ($sort + $limit)', 'Average order value', 'Orders by status breakdown', 'Date range filter via $match'],
      expectedOutput: 'An analytics API using MongoDB aggregation pipeline.',
      estimatedTime: '5–6 hours',
    },
  ],
}

// Normalize incoming language param to catalog key
function resolveLanguage(param) {
  const map = {
    html: 'HTML',
    css: 'CSS',
    javascript: 'JavaScript',
    js: 'JavaScript',
    react: 'React',
    node: 'Node',
    'node.js': 'Node',
    nodejs: 'Node',
    express: 'Express',
    'express.js': 'Express',
    mongodb: 'MongoDB',
    mongo: 'MongoDB',
  }
  return map[(param || '').toLowerCase().trim()] || null
}

async function getMiniProjects(req, res, next) {
  try {
    const lang = resolveLanguage(req.params.language)
    if (!lang) {
      res.status(404).json({ success: false, message: `No mini projects found for language: ${req.params.language}` })
      return
    }
    const projects = CATALOG[lang] || []
    res.json({ success: true, language: lang, projects })
  } catch (e) {
    next(e)
  }
}

module.exports = { getMiniProjects }
