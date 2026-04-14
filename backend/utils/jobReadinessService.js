const Progress = require('../models/Progress');
const Task = require('../models/Task');
const Video = require('../models/Video');
const Playlist = require('../models/Playlist');
const CodeSubmission = require('../models/CodeSubmission');
const Roadmap = require('../models/Roadmap');
const JobReadiness = require('../models/JobReadiness');
const User = require('../models/User');
const axios = require('axios');
const { computeJobReadinessScores } = require('./jobReadinessCalculator');

// Compute a 0-100 GitHub score from repo count, commit frequency, and star count
async function computeGithubScore(userId) {
  try {
    const user = await User.findById(userId).select('+github.accessToken').lean();
    if (!user?.github?.accessToken) return 0;

    const headers = {
      Authorization: `token ${user.github.accessToken}`,
      Accept: 'application/vnd.github+json',
    };

    const { data: repos } = await axios.get(
      'https://api.github.com/user/repos?per_page=100&sort=updated',
      { headers }
    );

    const repoCount  = repos.length;
    const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);
    const languages  = new Set(repos.map(r => r.language).filter(Boolean)).size;

    // Recent commit count via events API
    let commitCount = 0;
    try {
      const { data: events } = await axios.get(
        `https://api.github.com/users/${user.github.username}/events?per_page=100`,
        { headers }
      );
      commitCount = events
        .filter(e => e.type === 'PushEvent')
        .reduce((s, e) => s + (e.payload?.commits?.length || 0), 0);
    } catch { /* non-fatal */ }

    // Score components (each 0-100, then weighted)
    const repoScore    = Math.min(100, repoCount * 8);          // 13 repos = 100
    const commitScore  = Math.min(100, commitCount * 2);        // 50 commits = 100
    const starScore    = Math.min(100, totalStars * 5);         // 20 stars = 100
    const langScore    = Math.min(100, languages * 15);         // 7 languages = 100

    return Math.round(repoScore * 0.35 + commitScore * 0.40 + starScore * 0.15 + langScore * 0.10);
  } catch {
    return 0;
  }
}

async function recalculateJobReadiness(userId) {
  const playlists = await Playlist.find({ userId }).select('_id');
  const playlistIds = playlists.map((p) => p._id);
  const videos = await Video.find({ playlistId: { $in: playlistIds } }).select('_id');
  const videoIds = videos.map((v) => v._id);

  const totalTasks = await Task.countDocuments({ videoId: { $in: videoIds } });

  const userProgress = await Progress.find({ userId, completed: true });
  const completedTasks = userProgress.length;
  const taskIds = userProgress.map((p) => p.taskId);

  const completedTaskDocs = await Task.find({ _id: { $in: taskIds } });

  const submissions = await CodeSubmission.find({ userId }).sort({ submittedAt: -1 }).limit(300).lean();

  const roadmaps = await Roadmap.find({ userId });
  const miniProjectsCompleted = roadmaps.reduce((a, r) => a + (r.miniProjectsCompleted || 0), 0);

  const distinctDays = new Set(
    userProgress.filter((p) => p.completedAt).map((p) => p.completedAt.toISOString().slice(0, 10)),
  ).size;

  const scores = computeJobReadinessScores({
    totalTasks,
    completedTasks,
    completedTaskDocs,
    submissions,
    miniProjectsCompleted,
    distinctActiveDays: distinctDays,
    githubScore: await computeGithubScore(userId),
  });

  await JobReadiness.findOneAndUpdate(
    { userId },
    {
      codingScore:      scores.codingScore,
      debuggingScore:   scores.debuggingScore,
      projectScore:     scores.projectScore,
      consistencyScore: scores.consistencyScore,
      conceptAccuracy:  scores.conceptAccuracy,
      githubScore:      scores.githubScore,
      overallScore:     scores.overallScore,
      lastUpdated:      new Date(),
    },
    { upsert: true, new: true },
  );

  return scores;
}

module.exports = { recalculateJobReadiness };
