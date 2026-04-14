require('dotenv').config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
require('./config/githubAuth');
const connectDB = require('./config/db');
const routes = require('./routes');
const { errorHandler, HttpError } = require('./middleware/errorHandler');

const app = express();

const corsOptions = {
  origin: process.env.CLIENT_ORIGIN || true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '2mb' }));

app.use(session({
  secret: process.env.JWT_SECRET || 'devmate_session_secret',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'devmate-api' });
});

// GitHub OAuth routes — mounted at /auth/github to match callback URL
const githubRoutes = require('./routes/github.routes');
app.use('/auth/github', githubRoutes);

app.use('/api', routes);

app.use((req, res, next) => {
  next(new HttpError(404, `Not found: ${req.method} ${req.originalUrl}`));
});

app.use(errorHandler);

const PORT = parseInt(process.env.PORT, 10) || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`DevMate API listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start:', err.message);
    process.exit(1);
  });
