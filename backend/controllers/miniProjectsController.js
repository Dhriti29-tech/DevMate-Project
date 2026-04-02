const UserMiniProject = require('../models/UserMiniProject');
const { HttpError }   = require('../middleware/errorHandler');

// ── Static catalog — used as the first-load seed for known languages ──────
const CATALOG = {
  HTML: [
    { id:'html-1', title:'Personal Portfolio Page', level:'Beginner', difficulty:'Easy', estimatedTime:'2–3 hours',
      description:'Build a personal portfolio using semantic HTML5 elements. Include a header, about section, skills list, and contact form.',
      requirements:['Use semantic tags: header, main, section, footer','Navigation bar with anchor links','Unordered list of skills','Contact form with name, email, message fields'],
      expectedOutput:'A multi-section static portfolio page with correct semantic structure and working navigation.' },
    { id:'html-2', title:'Product Landing Page', level:'Beginner', difficulty:'Easy', estimatedTime:'2 hours',
      description:'Create a product landing page for a fictional SaaS app with a hero, features, and pricing section.',
      requirements:['Correct heading hierarchy (h1→h2→h3)','Hero section with tagline and CTA button','Features section with at least 3 feature cards','Pricing table with 3 tiers','Footer with links'],
      expectedOutput:'A clean, multi-section landing page with proper HTML structure and accessible markup.' },
    { id:'html-3', title:'Resume / CV Page', level:'Intermediate', difficulty:'Medium', estimatedTime:'3 hours',
      description:'Build a printable resume page using tables, definition lists, and semantic HTML.',
      requirements:['Table for work experience with company, role, dates','Definition lists for skills','Print stylesheet via @media print','Meta tags for SEO','Accessible landmark roles'],
      expectedOutput:'A structured resume page that renders correctly in browser and prints cleanly on A4.' },
  ],
  CSS: [
    { id:'css-1', title:'Responsive Card Grid', level:'Beginner', difficulty:'Easy', estimatedTime:'2–3 hours',
      description:'Build a responsive card grid layout using CSS Flexbox that reflows across breakpoints.',
      requirements:['Flexbox with flex-wrap','Cards with image, title, description, and action button','3 columns desktop / 2 tablet / 1 mobile','Hover lift effect with box-shadow transition'],
      expectedOutput:'A responsive card grid that adapts to all screen sizes without JavaScript.' },
    { id:'css-2', title:'CSS Grid Dashboard Layout', level:'Intermediate', difficulty:'Medium', estimatedTime:'3–4 hours',
      description:'Recreate a full admin dashboard shell using CSS Grid with named template areas.',
      requirements:['CSS Grid with named areas (sidebar, header, main, footer)','Sidebar collapses to icon-only on mobile','Header spans full width','At least 4 stat cards in main area','No JavaScript'],
      expectedOutput:'A pixel-perfect dashboard shell using only CSS Grid and media queries.' },
    { id:'css-3', title:'Dark/Light Theme Toggle', level:'Advanced', difficulty:'Hard', estimatedTime:'3–4 hours',
      description:'Implement a full dark/light theme system using CSS custom properties and a checkbox toggle.',
      requirements:['CSS variables for all colors, spacing, and shadows','Toggle switch component in pure CSS','Smooth 0.3s transition between themes','Persist preference using localStorage (JS allowed for storage only)','At least 5 themed components'],
      expectedOutput:'A theme-aware page that switches cleanly between dark and light modes with persisted preference.' },
  ],
  JavaScript: [
    { id:'js-1', title:'Todo List App', level:'Beginner', difficulty:'Easy', estimatedTime:'3–4 hours',
      description:'Build a fully functional todo app with add, complete, delete, and filter features using vanilla JS.',
      requirements:['Add todos on Enter or button click','Mark todos complete with toggle','Delete individual todos','Filter tabs: All / Active / Completed','Persist to localStorage','Show remaining count'],
      expectedOutput:'A working todo app that survives page refresh and correctly filters tasks.' },
    { id:'js-2', title:'Quiz App', level:'Beginner', difficulty:'Easy', estimatedTime:'3 hours',
      description:'Create a multiple-choice quiz app with score tracking, timer, and a results screen.',
      requirements:['At least 5 questions with 4 options each','Highlight correct/wrong answer after selection','60-second countdown timer per quiz','Track and display final score','Restart quiz button','Show correct answers on results screen'],
      expectedOutput:'An interactive quiz that shows final score, correct answers, and allows restart.' },
    { id:'js-3', title:'Weather Dashboard', level:'Intermediate', difficulty:'Medium', estimatedTime:'4 hours',
      description:'Fetch live weather data from OpenWeatherMap API and display a 5-day forecast dashboard.',
      requirements:['Search by city name with debounce','Display temperature, humidity, wind speed, UV index','5-day forecast cards','Toggle Celsius / Fahrenheit','Handle API errors with user-friendly messages','Loading skeleton while fetching'],
      expectedOutput:'A weather dashboard that fetches real data and shows a 5-day forecast with unit toggle.' },
    { id:'js-4', title:'Expense Tracker', level:'Intermediate', difficulty:'Medium', estimatedTime:'4–5 hours',
      description:'Build an expense tracker with income/expense entries, running balance, and chart visualization.',
      requirements:['Add income and expense transactions with category','Show running balance with color coding','Pie chart of spending by category (use Chart.js or canvas)','Delete transactions','Filter by date range','Persist to localStorage'],
      expectedOutput:'A functional expense tracker with persistent state and visual spending breakdown.' },
    { id:'js-5', title:'Real-Time Chat UI', level:'Advanced', difficulty:'Hard', estimatedTime:'5–6 hours',
      description:'Build a real-time chat interface using WebSockets (or simulated with setInterval).',
      requirements:['Message input with send on Enter','Display messages with sender name and timestamp','Simulated bot replies after 1–2 seconds','Auto-scroll to latest message','Emoji picker integration','Message read receipts'],
      expectedOutput:'A chat UI that feels real-time with bot responses, timestamps, and auto-scroll.' },
  ],
  React: [
    { id:'react-1', title:'Todo App with Filters', level:'Beginner', difficulty:'Easy', estimatedTime:'2–3 hours',
      description:'Build a todo app using React hooks with filter tabs and localStorage persistence.',
      requirements:['useState for task list','Add, complete, delete tasks','Filter: All / Active / Completed','Persist to localStorage with useEffect','Show task count per filter'],
      expectedOutput:'A React todo app that persists across refreshes and correctly filters tasks.' },
    { id:'react-2', title:'Weather Dashboard', level:'Intermediate', difficulty:'Medium', estimatedTime:'4–5 hours',
      description:'Build a weather dashboard using React that fetches from OpenWeatherMap API.',
      requirements:['Search input with debounce hook','useEffect for API calls','Display current weather and 5-day forecast','Loading and error states','Toggle Celsius / Fahrenheit','Responsive card layout'],
      expectedOutput:'A React weather dashboard with live API data, loading states, and unit toggle.' },
    { id:'react-3', title:'Notes Manager', level:'Intermediate', difficulty:'Medium', estimatedTime:'4–5 hours',
      description:'Build a notes manager app with create, edit, delete, search, and tag features.',
      requirements:['Create and edit notes with a rich textarea','Delete with confirmation modal','Search notes by title or content','Tag notes with colored labels','Sort by date or title','Persist to localStorage'],
      expectedOutput:'A fully functional notes manager with search, tags, and persistent storage.' },
    { id:'react-4', title:'Kanban Board', level:'Advanced', difficulty:'Hard', estimatedTime:'6–8 hours',
      description:'Build a drag-and-drop Kanban board with columns: Backlog, In Progress, Review, Done.',
      requirements:['Drag and drop cards between columns using HTML5 DnD API','Add, edit, delete cards','Assign priority (low/medium/high) with color coding','Column task count badges','Persist board state to localStorage','Filter cards by priority'],
      expectedOutput:'A functional Kanban board with drag-and-drop, priorities, and persistent state.' },
  ],
  Node: [
    { id:'node-1', title:'CLI Task Manager', level:'Beginner', difficulty:'Easy', estimatedTime:'2–3 hours',
      description:'Build a command-line task manager using Node.js that saves tasks to a JSON file.',
      requirements:['Add tasks with title and priority via CLI args','List all tasks with status','Mark tasks complete','Delete tasks by ID','Save/load from tasks.json using fs module','Color-coded output with chalk'],
      expectedOutput:'A CLI tool that manages tasks persistently across runs using a JSON file.' },
    { id:'node-2', title:'REST API — Notes App', level:'Intermediate', difficulty:'Medium', estimatedTime:'3–4 hours',
      description:'Build a full CRUD REST API for a notes app using Express and in-memory storage.',
      requirements:['GET /notes — list all with pagination','POST /notes — create with title and body validation','PUT /notes/:id — update','DELETE /notes/:id — delete','Search: GET /notes?q=keyword','Proper HTTP status codes and error responses'],
      expectedOutput:'A working REST API testable with Postman, with pagination and search.' },
    { id:'node-3', title:'JWT Authentication API', level:'Advanced', difficulty:'Hard', estimatedTime:'5–6 hours',
      description:'Implement a complete JWT authentication system with refresh tokens.',
      requirements:['POST /auth/signup with bcrypt password hashing','POST /auth/login returning access + refresh tokens','POST /auth/refresh to rotate tokens','Auth middleware for protected routes','GET /profile (protected)','Token blacklist on logout'],
      expectedOutput:'A secure auth API with access/refresh token rotation and protected routes.' },
  ],
  Express: [
    { id:'express-1', title:'Request Logger Middleware', level:'Beginner', difficulty:'Easy', estimatedTime:'2 hours',
      description:'Build a production-style request logger middleware for Express.',
      requirements:['Log method, URL, status code, response time','Color-code by status (2xx green, 4xx yellow, 5xx red)','Skip logging for /health and /favicon.ico','Write logs to a file using fs.appendFile','Configurable log level via env var'],
      expectedOutput:'A reusable logger middleware that logs to console and file with color coding.' },
    { id:'express-2', title:'File Upload & Management API', level:'Intermediate', difficulty:'Medium', estimatedTime:'3–4 hours',
      description:'Build an Express API for file uploads with validation, storage, and management.',
      requirements:['POST /upload with multipart/form-data using multer','Validate: only images (jpg/png/webp), max 5MB','Store with UUID filename in /uploads directory','GET /files — list all uploaded files with metadata','DELETE /files/:name — delete file','Serve files statically'],
      expectedOutput:'A file upload API with validation, UUID naming, listing, and deletion.' },
    { id:'express-3', title:'API Rate Limiter', level:'Advanced', difficulty:'Hard', estimatedTime:'4–5 hours',
      description:'Implement a sliding-window rate limiter middleware without external packages.',
      requirements:['Track requests per IP using a Map with timestamps','Sliding window algorithm (not fixed window)','Configurable: maxRequests and windowMs per route','Return 429 with Retry-After and X-RateLimit headers','Reset window after expiry','Unit tests for the limiter logic'],
      expectedOutput:'A sliding-window rate limiter that correctly throttles requests per IP.' },
  ],
  MongoDB: [
    { id:'mongo-1', title:'User CRUD API with Mongoose', level:'Beginner', difficulty:'Easy', estimatedTime:'3–4 hours',
      description:'Build a full CRUD API for users using Mongoose with validation and pagination.',
      requirements:['User schema: name, email (unique), age, role, createdAt','POST /users with Joi or express-validator validation','GET /users with pagination (page, limit query params)','PUT /users/:id — partial update','DELETE /users/:id — soft delete (deletedAt field)','GET /users/:id — single user'],
      expectedOutput:'A Mongoose-backed user API with validation, pagination, and soft delete.' },
    { id:'mongo-2', title:'Blog API with Relationships', level:'Intermediate', difficulty:'Medium', estimatedTime:'4–5 hours',
      description:'Build a blog API with Posts, Comments, and Users using Mongoose references and populate.',
      requirements:['Post schema with author ref to User','Comment schema with post ref and author ref','GET /posts/:id populates author and comments with author','Cascade delete comments when post is deleted','Index on post.createdAt for sort performance','Like/unlike post endpoint'],
      expectedOutput:'A relational blog API using Mongoose populate with cascade delete and likes.' },
    { id:'mongo-3', title:'E-Commerce Analytics API', level:'Advanced', difficulty:'Hard', estimatedTime:'5–6 hours',
      description:'Use MongoDB aggregation pipeline to build analytics endpoints for an orders collection.',
      requirements:['Total revenue per month using $group and $project','Top 10 products by revenue with $lookup to products','Average order value and order count per customer','Orders by status breakdown with percentages','Date range filter via $match','Export results as CSV endpoint'],
      expectedOutput:'An analytics API using aggregation pipeline with date filtering and CSV export.' },
  ],
};

// ── AI generation ─────────────────────────────────────────────────────────
async function generateProjectsWithAI(language, existingTitles = []) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const model = (process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat').trim();
  const exclude = existingTitles.length > 0
    ? `\nDo NOT generate any of these already-existing projects:\n${existingTitles.map(t => `- ${t}`).join('\n')}\n`
    : '';

  const prompt = [
    `Generate exactly 3 REAL-WORLD mini project ideas for the programming language: ${language}`,
    '',
    'IMPORTANT RULES:',
    '- Projects must be practical, realistic, and commonly built by developers learning this language.',
    '- Do NOT generate generic placeholders like "Starter Project", "Basic App", "Setup Project", or "Advanced Challenge".',
    '- Each project must be something a real developer would actually build and put on their portfolio.',
    '- Vary the difficulty: one Beginner, one Intermediate, one Advanced.',
    exclude,
    'Each project must have:',
    '- title: A specific, descriptive project name (e.g. "Student Management System", "Expense Tracker CLI")',
    '- description: 1-2 sentences explaining what the project does and why it is useful',
    '- level: exactly one of "Beginner", "Intermediate", or "Advanced"',
    '- difficulty: exactly one of "Easy", "Medium", or "Hard"',
    '- estimatedTime: realistic time estimate (e.g. "3–4 hours", "6–8 hours")',
    '- requirements: array of 4–6 specific, actionable implementation steps',
    '- expectedOutput: 1 sentence describing what the finished project does',
    '',
    'Return ONLY valid JSON, no markdown, no explanation:',
    '{',
    '  "projects": [',
    '    {',
    '      "title": "string",',
    '      "description": "string",',
    '      "level": "Beginner|Intermediate|Advanced",',
    '      "difficulty": "Easy|Medium|Hard",',
    '      "estimatedTime": "string",',
    '      "requirements": ["step 1", "step 2", "step 3", "step 4"],',
    '      "expectedOutput": "string"',
    '    }',
    '  ]',
    '}',
  ].join('\n');

  try {
    const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'DevMate',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,   // some variety so repeated calls give different projects
        max_tokens: 1200,
      }),
    });

    if (!resp.ok) {
      console.error('[MiniProjects] AI error:', resp.status);
      return null;
    }

    const data = await resp.json();
    const content = data?.data?.choices?.[0]?.message?.content
      ?? data?.choices?.[0]?.message?.content
      ?? null;

    if (!content) return null;

    // Extract JSON from response
    const stripped = content.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
    const start = stripped.indexOf('{');
    const end   = stripped.lastIndexOf('}');
    if (start === -1 || end === -1) return null;

    const parsed = JSON.parse(stripped.slice(start, end + 1));
    const projects = Array.isArray(parsed?.projects) ? parsed.projects : null;
    if (!projects || projects.length === 0) return null;

    console.log(`[MiniProjects] AI generated ${projects.length} projects for ${language}`);
    return projects;
  } catch (e) {
    console.error('[MiniProjects] AI generation failed:', e.message);
    return null;
  }
}

// Convert a raw project object (from catalog or AI) to a DB entry
function toEntry(p, idx, prefix) {
  const VALID_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
  const VALID_DIFFS  = ['Easy', 'Medium', 'Hard'];
  return {
    projectId:      p.id || `${prefix}-ai-${Date.now()}-${idx}`,
    title:          (typeof p.title === 'string' && p.title.trim()) || `Project ${idx + 1}`,
    description:    typeof p.description === 'string' ? p.description : '',
    level:          VALID_LEVELS.includes(p.level) ? p.level : 'Beginner',
    difficulty:     VALID_DIFFS.includes(p.difficulty) ? p.difficulty : 'Easy',
    requirements:   Array.isArray(p.requirements) ? p.requirements.map(String) : [],
    expectedOutput: typeof p.expectedOutput === 'string' ? p.expectedOutput : '',
    estimatedTime:  typeof p.estimatedTime  === 'string' ? p.estimatedTime  : '3–4 hours',
    status:         'unlocked',
    savedCode:      '',
    submittedRepo:  '',
    aiScore:        null,
  };
}

function catalogForLanguage(language) {
  if (CATALOG[language]) return CATALOG[language];
  const key = Object.keys(CATALOG).find(k => k.toLowerCase() === language.toLowerCase());
  return key ? CATALOG[key] : null;
}

// ── GET /api/mini-projects/user/:language ─────────────────────────────────
async function getUserProjects(req, res, next) {
  try {
    const language = (req.params.language || '').trim();
    if (!language) { next(new HttpError(400, 'language is required')); return; }

    let doc = await UserMiniProject.findOne({ userId: req.userId, language });
    if (doc) {
      return res.json({ success: true, language, projects: doc.projects });
    }

    // First visit — try catalog, then AI, then minimal fallback
    const catalog = catalogForLanguage(language);
    let seed;
    if (catalog) {
      seed = catalog.map((p, i) => toEntry(p, i, language.toLowerCase()));
    } else {
      // Unknown language — generate with AI
      const aiProjects = await generateProjectsWithAI(language);
      seed = aiProjects
        ? aiProjects.map((p, i) => toEntry(p, i, language.toLowerCase()))
        : [
            toEntry({ title: `${language} Beginner Project`, level: 'Beginner', difficulty: 'Easy',
              description: `Build a beginner-level ${language} project.`,
              requirements: ['Set up the project', 'Implement core feature', 'Add error handling', 'Write documentation'],
              expectedOutput: `A working ${language} beginner project.`, estimatedTime: '2–3 hours' }, 0, language.toLowerCase()),
          ];
    }

    doc = await UserMiniProject.create({ userId: req.userId, language, projects: seed });
    res.json({ success: true, language, projects: doc.projects });
  } catch (e) { next(e); }
}

// ── POST /api/mini-projects/save-code ─────────────────────────────────────
async function saveCode(req, res, next) {
  try {
    const { language, projectId, code } = req.body;
    if (!language || !projectId) { next(new HttpError(400, 'language and projectId are required')); return; }

    const doc = await UserMiniProject.findOneAndUpdate(
      { userId: req.userId, language, 'projects.projectId': projectId },
      { $set: { 'projects.$.savedCode': code || '' } },
      { new: true },
    );
    if (!doc) { next(new HttpError(404, 'Project not found')); return; }

    const project = doc.projects.find(p => p.projectId === projectId);
    res.json({ success: true, project });
  } catch (e) { next(e); }
}

// ── POST /api/mini-projects/submit ────────────────────────────────────────
async function submitProject(req, res, next) {
  try {
    const { language, projectId, submittedRepo = '', aiScore = null } = req.body;
    if (!language || !projectId) { next(new HttpError(400, 'language and projectId are required')); return; }

    const doc = await UserMiniProject.findOneAndUpdate(
      { userId: req.userId, language, 'projects.projectId': projectId },
      { $set: {
        'projects.$.status':        'submitted',
        'projects.$.submittedRepo': submittedRepo,
        'projects.$.aiScore':       typeof aiScore === 'number' ? aiScore : null,
        'projects.$.submittedAt':   new Date(),
      }},
      { new: true },
    );
    if (!doc) { next(new HttpError(404, 'Project not found')); return; }

    const project = doc.projects.find(p => p.projectId === projectId);
    res.json({ success: true, project });
  } catch (e) { next(e); }
}

// ── POST /api/mini-projects/more ──────────────────────────────────────────
// Always generates NEW projects via AI — no catalog limit.
async function moreProjects(req, res, next) {
  try {
    const { language } = req.body;
    if (!language) { next(new HttpError(400, 'language is required')); return; }

    const doc = await UserMiniProject.findOne({ userId: req.userId, language });
    const existingTitles = (doc?.projects || []).map(p => p.title);

    // Generate fresh projects with AI, passing existing titles to avoid duplicates
    const aiProjects = await generateProjectsWithAI(language, existingTitles);

    if (!aiProjects || aiProjects.length === 0) {
      // AI unavailable — return current list with a message
      return res.json({
        success: true,
        added: 0,
        aiUnavailable: true,
        projects: doc?.projects || [],
      });
    }

    // Deduplicate against existing titles (case-insensitive)
    const existingSet = new Set(existingTitles.map(t => t.toLowerCase()));
    const fresh = aiProjects
      .filter(p => !existingSet.has((p.title || '').toLowerCase()))
      .map((p, i) => toEntry(p, i, `${language.toLowerCase()}-more`));

    if (fresh.length === 0) {
      return res.json({ success: true, added: 0, projects: doc?.projects || [] });
    }

    let updated;
    if (!doc) {
      updated = await UserMiniProject.create({ userId: req.userId, language, projects: fresh });
    } else {
      updated = await UserMiniProject.findOneAndUpdate(
        { userId: req.userId, language },
        { $push: { projects: { $each: fresh } } },
        { new: true },
      );
    }

    res.json({ success: true, added: fresh.length, projects: updated.projects });
  } catch (e) { next(e); }
}

module.exports = { getUserProjects, saveCode, submitProject, moreProjects };
