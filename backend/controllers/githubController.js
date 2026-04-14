const axios = require('axios');
const User = require('../models/User');
const { evaluateCode } = require('../utils/aiService');

// Helper — GitHub API request with the user's stored accessToken
async function githubGet(url, accessToken) {
  return axios.get(url, {
    headers: {
      Authorization: `token ${accessToken}`,
      Accept: 'application/vnd.github+json',
    },
  });
}

// GET /api/github/repos
// Returns all repos for the authenticated GitHub user
exports.getRepos = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('+github.accessToken');
    if (!user?.github?.accessToken) {
      return res.status(401).json({ success: false, message: 'GitHub not connected. Please login with GitHub.' });
    }

    const { data } = await githubGet(
      'https://api.github.com/user/repos?per_page=100&sort=updated',
      user.github.accessToken
    );

    const repos = data.map((r) => ({
      id:          r.id,
      name:        r.name,
      fullName:    r.full_name,
      description: r.description,
      url:         r.html_url,
      language:    r.language,
      stars:       r.stargazers_count,
      forks:       r.forks_count,
      updatedAt:   r.updated_at,
      isPrivate:   r.private,
    }));

    res.json({ success: true, repos });
  } catch (err) {
    console.error('getRepos error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch repositories' });
  }
};

// GET /api/github/commits?repo=owner/repo
// Returns recent commits for a specific repo
exports.getCommits = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('+github.accessToken');
    if (!user?.github?.accessToken) {
      return res.status(401).json({ success: false, message: 'GitHub not connected.' });
    }

    const repo = req.query.repo; // e.g. "username/repo-name"
    if (!repo) return res.status(400).json({ success: false, message: 'repo query param required' });

    const { data } = await githubGet(
      `https://api.github.com/repos/${repo}/commits?per_page=30`,
      user.github.accessToken
    );

    const commits = data.map((c) => ({
      sha:     c.sha.slice(0, 7),
      message: c.commit.message,
      author:  c.commit.author.name,
      date:    c.commit.author.date,
      url:     c.html_url,
    }));

    // Streak logic — check if there's a commit today
    const today = new Date().toISOString().slice(0, 10);
    const hasCommitToday = commits.some((c) => c.date.slice(0, 10) === today);

    res.json({ success: true, commits, hasCommitToday });
  } catch (err) {
    console.error('getCommits error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch commits' });
  }
};

// GET /api/github/repo-contents?repo=owner/repo&path=
// Fetches file tree or file content for AI review
exports.getRepoContents = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('+github.accessToken');
    if (!user?.github?.accessToken) {
      return res.status(401).json({ success: false, message: 'GitHub not connected.' });
    }

    const { repo, path = '' } = req.query;
    if (!repo) return res.status(400).json({ success: false, message: 'repo query param required' });

    const { data } = await githubGet(
      `https://api.github.com/repos/${repo}/contents/${path}`,
      user.github.accessToken
    );

    res.json({ success: true, contents: data });
  } catch (err) {
    console.error('getRepoContents error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch repo contents' });
  }
};

// GET /api/github/profile
// Returns connected GitHub username and stats
exports.getGithubProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('+github.accessToken');
    if (!user?.github?.accessToken) {
      return res.status(401).json({ success: false, message: 'GitHub not connected.' });
    }

    const { data } = await githubGet('https://api.github.com/user', user.github.accessToken);

    res.json({
      success: true,
      profile: {
        username:   data.login,
        name:       data.name,
        avatar:     data.avatar_url,
        bio:        data.bio,
        publicRepos: data.public_repos,
        followers:  data.followers,
        following:  data.following,
        profileUrl: data.html_url,
      },
    });
  } catch (err) {
    console.error('getGithubProfile error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch GitHub profile' });
  }
};

// POST /api/github/review
// Body: { repoUrl, projectTitle?, projectDescription? }
// Fetches top-level files from the repo, concatenates readable code, sends to AI
exports.reviewGithubRepo = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('+github.accessToken');
    if (!user?.github?.accessToken) {
      return res.status(401).json({ success: false, message: 'GitHub not connected.' });
    }

    const { repoUrl, projectTitle = '', projectDescription = '' } = req.body;
    if (!repoUrl) return res.status(400).json({ success: false, message: 'repoUrl is required' });

    // Parse owner/repo from URL e.g. https://github.com/user/repo
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/\s?#]+)/);
    if (!match) return res.status(400).json({ success: false, message: 'Invalid GitHub repo URL' });
    const [, owner, repo] = match;

    // Fetch root contents
    const { data: contents } = await githubGet(
      `https://api.github.com/repos/${owner}/${repo}/contents`,
      user.github.accessToken
    );

    // Collect readable source files (skip binaries, lock files, node_modules)
    const SKIP = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', '.gitignore', '.env']
    const CODE_EXTS = ['.js', '.jsx', '.ts', '.tsx', '.py', '.html', '.css', '.json', '.md']
    const files = contents.filter(f =>
      f.type === 'file' &&
      !SKIP.includes(f.name) &&
      CODE_EXTS.some(ext => f.name.endsWith(ext))
    ).slice(0, 10) // max 10 files to stay within token limits

    // Fetch file contents in parallel
    const fileContents = await Promise.all(
      files.map(async (f) => {
        try {
          const { data } = await githubGet(f.download_url, user.github.accessToken);
          // data is raw text when fetching download_url
          const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
          return `// ── ${f.name} ──\n${text.slice(0, 3000)}`; // cap per file
        } catch {
          return `// ── ${f.name} — could not fetch ──`;
        }
      })
    );

    const combinedCode = fileContents.join('\n\n');

    if (!combinedCode.trim()) {
      return res.status(400).json({ success: false, message: 'No readable source files found in this repo' });
    }

    // Send to AI for review
    const result = await evaluateCode(combinedCode, projectDescription, {
      taskTitle: projectTitle || `${owner}/${repo}`,
      taskDescription: projectDescription || `Review the GitHub repository ${owner}/${repo}`,
    });

    res.json({
      success: true,
      repo: `${owner}/${repo}`,
      filesReviewed: files.map(f => f.name),
      score:       result.score,
      feedback:    result.feedback,
      errors:      result.errors,
      suggestions: result.suggestions,
    });
  } catch (err) {
    console.error('reviewGithubRepo error:', err.message);
    res.status(500).json({ success: false, message: err.message || 'Failed to review repository' });
  }
};

// POST /api/github/sync-streak
// Checks all user repos for a commit today — if found, increments streak
exports.syncCommitStreak = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('+github.accessToken');
    if (!user?.github?.accessToken) {
      return res.status(401).json({ success: false, message: 'GitHub not connected.' });
    }

    const today = new Date().toISOString().slice(0, 10);

    // Fetch recent commits across all repos (check up to 10 most recently updated)
    const { data: repos } = await githubGet(
      'https://api.github.com/user/repos?per_page=10&sort=updated',
      user.github.accessToken
    );

    let hasCommitToday = false;
    for (const repo of repos) {
      try {
        const { data: commits } = await githubGet(
          `https://api.github.com/repos/${repo.full_name}/commits?per_page=5&author=${user.github.username}`,
          user.github.accessToken
        );
        if (commits.some(c => c.commit?.author?.date?.slice(0, 10) === today)) {
          hasCommitToday = true;
          break;
        }
      } catch {
        // skip repos we can't access
      }
    }

    if (!hasCommitToday) {
      return res.json({
        success: true,
        hasCommitToday: false,
        streakCount: user.streakCount,
        message: 'No commits found today — keep coding!',
      });
    }

    // Reuse same streak logic as login
    function startOfDayUTC(d) {
      return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    }

    const todayUTC = startOfDayUTC(new Date());
    const last = user.lastLoginDate ? startOfDayUTC(new Date(user.lastLoginDate)) : null;
    const diffDays = last ? Math.round((todayUTC - last) / 86400000) : -1;

    let newStreak = user.streakCount || 0;
    if (diffDays !== 0) {
      // Only boost if not already updated today
      newStreak = diffDays === 1 ? newStreak + 1 : 1;
      user.streakCount  = newStreak;
      user.lastLoginDate = todayUTC;
      await user.save();
    }

    res.json({
      success: true,
      hasCommitToday: true,
      streakCount: user.streakCount,
      message: diffDays === 0
        ? 'Streak already counted for today.'
        : `Commit streak boosted to ${user.streakCount} days! 🔥`,
    });
  } catch (err) {
    console.error('syncCommitStreak error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to sync commit streak' });
  }
};
