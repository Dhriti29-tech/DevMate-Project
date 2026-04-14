const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// Step 1: Redirect user to GitHub
router.get('/', passport.authenticate('github', { scope: ['user', 'repo'] }));

// Step 2: GitHub redirects back here
router.get('/callback',
  passport.authenticate('github', { failureRedirect: `${CLIENT_ORIGIN}/login?error=github_failed`, session: false }),
  async (req, res) => {
    try {
      const { githubId, username, accessToken } = req.user;

      // Find or create user, always update accessToken so it stays fresh
      let user = await User.findOne({ githubId });
      if (!user) {
        user = await User.create({
          name: username,
          email: `${username}@github.com`,
          password: Math.random().toString(36),
          githubId,
          github: { id: githubId, username, accessToken },
        });
      } else {
        // Update accessToken in case it changed
        user.github = { id: githubId, username, accessToken };
        await user.save();
      }

      // Issue JWT same as normal login
      const token = jwt.sign(
        { sub: user._id.toString(), role: user.role, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // Redirect to frontend with token
      res.redirect(`${CLIENT_ORIGIN}/auth/github/success?token=${token}`);
    } catch (err) {
      console.error('GitHub OAuth error:', err.message);
      res.redirect(`${CLIENT_ORIGIN}/login?error=github_failed`);
    }
  }
);

module.exports = router;
