const mongoose = require('mongoose');

const projectEntrySchema = new mongoose.Schema({
  projectId:     { type: String, required: true },   // catalog id e.g. "react-1"
  title:         { type: String, required: true },
  description:   { type: String, default: '' },
  level:         { type: String, default: 'Beginner' },
  difficulty:    { type: String, default: 'Easy' },
  requirements:  [{ type: String }],
  expectedOutput:{ type: String, default: '' },
  estimatedTime: { type: String, default: '' },
  status:        { type: String, enum: ['unlocked', 'submitted'], default: 'unlocked' },
  savedCode:     { type: String, default: '' },
  submittedRepo: { type: String, default: '' },
  aiScore:       { type: Number, default: null },
  submittedAt:   { type: Date,   default: null },
}, { _id: false });

const userMiniProjectSchema = new mongoose.Schema(
  {
    userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    language: { type: String, required: true, trim: true },
    projects: [projectEntrySchema],
  },
  { timestamps: true },
);

userMiniProjectSchema.index({ userId: 1, language: 1 }, { unique: true });

module.exports = mongoose.model('UserMiniProject', userMiniProjectSchema);
