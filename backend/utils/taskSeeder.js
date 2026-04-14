const Task = require('../models/Task');
const Video = require('../models/Video');
const Progress = require('../models/Progress');
const CodeSubmission = require('../models/CodeSubmission');

const DEFAULT_FALLBACK_TASKS = [
  {
    title: 'Practice concepts from video',
    description: 'Write code based on video topic',
    difficulty: 'medium',
  },
  {
    title: 'Create small project',
    description: 'Build something related to topic',
    difficulty: 'medium',
  },
];

function normalizeAiTask(task, idx) {
  const title = typeof task?.title === 'string' && task.title.trim() ? task.title.trim() : `Task ${idx + 1}`;
  const description =
    typeof task?.description === 'string' && task.description.trim() ? task.description.trim() : '';
  const difficulty = ['easy', 'medium', 'hard'].includes(task?.difficulty) ? task.difficulty : 'medium';
  return { title, description, difficulty };
}

function fallbackWithVideoSafe(videoId) {
  return DEFAULT_FALLBACK_TASKS.map((t, i) => ({
    videoId,
    title: t.title,
    description: t.description,
    difficulty: t.difficulty,
    starterCode: '// Start here\n',
    expectedOutput: '',
    hints: [],
    order: i,
  }));
}

async function generateTasksWithOpenRouter(videoTitle) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return { ok: false, tasks: null, reason: 'Missing OPENROUTER_API_KEY' };

  // Use the same model as the rest of the AI system
  const model = (process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat').trim();

  const aiPrompt = [
    `Generate exactly 2 practical coding tasks based on this video topic: "${videoTitle}"`,
    '',
    'Return ONLY valid JSON, no markdown, no explanation:',
    '{',
    '  "tasks": [',
    '    { "title": "Task name", "description": "Clear task description", "difficulty": "easy|medium|hard" },',
    '    { "title": "Task name", "description": "Clear task description", "difficulty": "easy|medium|hard" }',
    '  ]',
    '}',
    '',
    'IMPORTANT: Start your response with { and end with }. Nothing outside the JSON.',
  ].join('\n');

  const requestBody = {
    model,
    messages: [{ role: 'user', content: aiPrompt }],
    temperature: 0,
    max_tokens: 400,
    // response_format intentionally omitted — not supported by all OpenRouter models
  };

  console.log('[TaskSeeder] Generating tasks for:', videoTitle, '| model:', model);

  const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:5173',
      'X-Title': 'DevMate',
    },
    body: JSON.stringify(requestBody),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    console.error('[TaskSeeder] OpenRouter error:', resp.status, text.slice(0, 200));
    return { ok: false, tasks: null, reason: `OpenRouter error ${resp.status}` };
  }

  const response = await resp.json();
  const content =
    response?.data?.choices?.[0]?.message?.content ??
    response?.choices?.[0]?.message?.content ??
    null;

  console.log('[TaskSeeder] AI response:', String(content || '').slice(0, 300));

  if (!content || typeof content !== 'string') {
    return { ok: false, tasks: null, reason: 'Missing AI message content' };
  }

  // Extract JSON — strip markdown fences and slice from first { to last }
  const stripped = content.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
  const start = stripped.indexOf('{');
  const end   = stripped.lastIndexOf('}');
  if (start === -1 || end === -1) return { ok: false, tasks: null, reason: 'No JSON object in response' };

  try {
    const parsed = JSON.parse(stripped.slice(start, end + 1));
    const tasks = Array.isArray(parsed?.tasks) ? parsed.tasks : null;
    if (!tasks || tasks.length === 0) return { ok: false, tasks: null, reason: 'No tasks in AI response' };
    return { ok: true, tasks };
  } catch (e) {
    console.warn('[TaskSeeder] JSON parse failed:', e.message);
    return { ok: false, tasks: null, reason: 'JSON parse failed' };
  }
}

async function ensureTasksForVideo(videoId, videoTitleOverride) {
  // Always return existing tasks — never regenerate once created.
  const existing = await Task.find({ videoId }).sort({ order: 1 });
  if (existing.length > 0) return existing;

  // No tasks yet — generate for the first time.
  const video = await Video.findById(videoId).select('title').lean();
  const videoTitle = (videoTitleOverride && String(videoTitleOverride).trim()) || video?.title || 'video topic';

  let generated = null;
  try {
    const aiResult = await generateTasksWithOpenRouter(videoTitle);
    if (aiResult.ok) generated = aiResult.tasks;
  } catch (e) {
    // If OpenRouter fails, we fall back below.
  }

  const taskDocs = (generated && Array.isArray(generated) ? generated : DEFAULT_FALLBACK_TASKS).slice(0, 2).map((t, i) => {
    const norm = normalizeAiTask(t, i);
    return {
      videoId,
      title: norm.title,
      description: norm.description,
      difficulty: norm.difficulty,
      starterCode: '// Start here\n',
      expectedOutput: '',
      hints: [],
      order: i,
    };
  });

  const created = await Task.insertMany(taskDocs);
  return created;
}

module.exports = { ensureTasksForVideo };
