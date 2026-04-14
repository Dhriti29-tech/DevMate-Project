const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: false, select: false },
    githubId: { type: String, default: null },
    github: {
      id:          { type: String, default: null },
      username:    { type: String, default: null },
      accessToken: { type: String, default: null, select: false },
    },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    currentLanguage: { type: String, default: null, trim: true },
    completedLanguages: [{ type: String, trim: true }],
    upcomingLanguages: [{ type: String, trim: true }],
    // Daily login streak tracking (updates on successful /auth/login).
    lastLoginDate: { type: Date, default: null },
    streakCount: { type: Number, default: 0, min: 0 },
    // Accumulated XP — preserved across roadmap resets.
    totalXP: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

userSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
