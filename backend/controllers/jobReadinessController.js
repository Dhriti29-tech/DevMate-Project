const JobReadiness = require('../models/JobReadiness');
const VideoProgress = require('../models/VideoProgress');
const UserMiniProject = require('../models/UserMiniProject');
const UserSkill = require('../models/UserSkill');
const { recalculateJobReadiness } = require('../utils/jobReadinessService');

async function getScore(req, res, next) {
  try {
    await recalculateJobReadiness(req.userId);
    const doc = await JobReadiness.findOne({ userId: req.userId });
    res.json({
      success: true,
      score: doc || {
        codingScore: 0,
        debuggingScore: 0,
        projectScore: 0,
        consistencyScore: 0,
        conceptAccuracy: 0,
        overallScore: 0,
        lastUpdated: null,
      },
    });
  } catch (e) {
    next(e);
  }
}

async function getReport(req, res, next) {
  try {
    await recalculateJobReadiness(req.userId);
    const doc = await JobReadiness.findOne({ userId: req.userId }).lean();
    const overall = doc?.overallScore ?? 0;

    // ── Band label ────────────────────────────────────────────────────────
    const band =
      overall >= 85 ? 'Strong candidate'
      : overall >= 65 ? 'Junior-ready'
      : overall >= 40 ? 'Building foundation'
      : 'Getting started';

    const levelLabel =
      overall >= 85 ? 'Mid-Level Dev'
      : overall >= 65 ? 'Junior Dev'
      : overall >= 40 ? 'Learner'
      : 'Getting started';

    const nextLabel =
      overall >= 85 ? 'Senior Dev'
      : overall >= 65 ? 'Mid-Level'
      : overall >= 40 ? 'Junior Dev'
      : 'Junior Dev';

    // ── Per-language skill progress from VideoProgress ────────────────────
    const skill = await UserSkill.findOne({ userId: req.userId }).lean();
    const isCustom = skill?.startMode === 'custom';
    const languageList = isCustom && skill?.customLanguages?.length
      ? skill.customLanguages
      : ['HTML', 'CSS', 'JavaScript', 'React', 'Node', 'Express', 'MongoDB'];

    const vpRows = await VideoProgress.find({ userId: req.userId }).select('language completed').lean();
    const totalByLang    = new Map();
    const completedByLang = new Map();
    for (const row of vpRows) {
      if (!row.language) continue;
      totalByLang.set(row.language, (totalByLang.get(row.language) || 0) + 1);
      if (row.completed) completedByLang.set(row.language, (completedByLang.get(row.language) || 0) + 1);
    }

    const langProgress = languageList
      .filter((lang) => (totalByLang.get(lang) || 0) > 0)
      .map((lang) => {
        const total     = totalByLang.get(lang)    || 0;
        const completed = completedByLang.get(lang) || 0;
        return { skill: lang, score: total ? Math.round((completed / total) * 100) : 0 };
      });

    // ── Strengths / weaknesses from language progress ─────────────────────
    const strengths  = langProgress.filter((l) => l.score >= 60).sort((a, b) => b.score - a.score).slice(0, 6);
    const weaknesses = langProgress
      .filter((l) => l.score < 60)
      .sort((a, b) => a.score - b.score)
      .slice(0, 6)
      .map((l) => ({ ...l, action: `Complete more ${l.skill} videos` }));

    // Fall back to dimension-based strengths/weaknesses if no language data yet
    if (strengths.length === 0 && weaknesses.length === 0) {
      const dims = [
        ['Coding & concepts',    doc?.codingScore      ?? 0],
        ['Debugging & delivery', doc?.debuggingScore   ?? 0],
        ['Projects & portfolio', doc?.projectScore     ?? 0],
        ['Consistency',          doc?.consistencyScore ?? 0],
      ];
      for (const [label, val] of dims) {
        const rounded = Math.round(val);
        if (val >= 60) strengths.push({ skill: label, score: rounded });
        else           weaknesses.push({ skill: label, score: rounded, action: `Practice more ${label.toLowerCase()} tasks` });
      }
    }

    // ── Mini project count ────────────────────────────────────────────────
    const miniDocs = await UserMiniProject.find({ userId: req.userId }).lean();
    let projectsSubmitted = 0;
    for (const d of miniDocs) {
      projectsSubmitted += (d.projects || []).filter((p) => p.status === 'submitted').length;
    }

    // ── Dynamic suggestions ───────────────────────────────────────────────
    const suggestions = [];

    if (weaknesses.length > 0) {
      suggestions.push({
        title:    `Improve ${weaknesses[0].skill}`,
        priority: 'High',
        xp:       '+150 XP',
      });
    }
    if (projectsSubmitted < 3) {
      suggestions.push({
        title:    `Build ${Math.max(1, 3 - projectsSubmitted)} more mini project${3 - projectsSubmitted !== 1 ? 's' : ''}`,
        priority: 'High',
        xp:       '+200 XP',
      });
    }
    if (overall < 70) {
      suggestions.push({
        title:    'Complete more playlist tasks',
        priority: 'Medium',
        xp:       '+120 XP',
      });
    }
    if (weaknesses.length > 1) {
      suggestions.push({
        title:    `Work on ${weaknesses[1].skill}`,
        priority: 'Medium',
        xp:       '+100 XP',
      });
    }
    // Always show at least one suggestion
    if (suggestions.length === 0) {
      suggestions.push({
        title:    'Keep completing tasks to maintain your score',
        priority: 'Low',
        xp:       '+50 XP',
      });
    }

    res.json({
      success: true,
      report: {
        overallScore: overall,
        band,
        levelLabel,
        nextLabel,
        breakdown:   doc,
        strengths:   strengths.slice(0, 6),
        weaknesses:  weaknesses.slice(0, 6),
        suggestions: suggestions.slice(0, 4),
        projectsSubmitted,
      },
    });
  } catch (e) {
    next(e);
  }
}

module.exports = { getScore, getReport };
