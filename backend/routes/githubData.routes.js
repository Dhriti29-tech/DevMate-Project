const express = require('express');
const { getRepos, getCommits, getRepoContents, getGithubProfile, reviewGithubRepo, syncCommitStreak } = require('../controllers/githubController');
const { authMiddleware } = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// All routes require JWT auth
router.use(authMiddleware);

router.get('/profile',       asyncHandler(getGithubProfile));
router.get('/repos',         asyncHandler(getRepos));
router.get('/commits',       asyncHandler(getCommits));
router.get('/repo-contents', asyncHandler(getRepoContents));
router.post('/review',        asyncHandler(reviewGithubRepo));
router.post('/sync-streak',   asyncHandler(syncCommitStreak));

module.exports = router;
