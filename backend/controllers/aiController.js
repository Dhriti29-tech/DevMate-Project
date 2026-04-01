const mongoose = require('mongoose')
const { body } = require('express-validator')
const { HttpError } = require('../middleware/errorHandler')
const { evaluateCode } = require('../utils/aiService')
const CodeSubmission = require('../models/CodeSubmission')
const Task = require('../models/Task')
const Video = require('../models/Video')
const Playlist = require('../models/Playlist')

function aiEvaluateValidators() {
  return [
    body('code')
      .isString().trim().notEmpty()
      .withMessage('code is required'),
    body('taskTitle')
      .optional().isString().trim(),
    body('taskDescription')
      .optional().isString().trim(),
    // Legacy field — kept for backwards compat
    body('problemDescription')
      .optional().isString().trim(),
    body('taskId')
      .optional().isString().trim(),
    body('videoId')
      .optional().isString().trim(),
  ]
}

// Verify the task belongs to the authenticated user's playlist
async function resolveTaskOwnership(userId, taskId) {
  if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) return null
  const task = await Task.findById(taskId).lean()
  if (!task) return null
  const video = await Video.findById(task.videoId).lean()
  if (!video) return null
  const playlist = await Playlist.findOne({ _id: video.playlistId, userId }).lean()
  if (!playlist) return null
  return task
}

async function evaluateCodeController(req, res, next) {
  try {
    const {
      code,
      taskTitle        = '',
      taskDescription  = '',
      problemDescription = '',
      taskId           = null,
      videoId          = null,
    } = req.body

    // Use taskDescription if provided, fall back to legacy problemDescription
    const description = taskDescription || problemDescription

    console.log('[AI] /evaluate called | taskId:', taskId, '| user:', req.userId)

    // ── Call OpenRouter ───────────────────────────────────────────────────
    let result
    try {
      result = await evaluateCode(code, description, { taskTitle, taskDescription: description })
    } catch (aiErr) {
      console.error('[AI] evaluateCode threw:', aiErr.message)
      // Return a safe fallback — do not crash the request
      return res.status(200).json({
        success: false,
        error: 'AI evaluation failed. Please try again.',
        score: 0,
        feedback: aiErr.message || 'AI evaluation failed.',
        errors: [],
        suggestions: [],
        optimizedCode: null,
        passed: false,
      })
    }

    const passed = result.score >= 70

    // ── Persist to CodeSubmission ─────────────────────────────────────────
    // Only save if we have a valid taskId that belongs to this user
    const task = await resolveTaskOwnership(req.userId, taskId)
    if (task) {
      try {
        await CodeSubmission.create({
          userId: req.userId,
          taskId: task._id,
          code,
          status: passed ? 'passed' : 'failed',
          executionResult: {
            output: result.feedback,
            error: result.errors.length > 0 ? result.errors.join('; ') : null,
            score: result.score,
          },
          submittedAt: new Date(),
        })
        console.log('[AI] Submission saved | taskId:', task._id, '| score:', result.score)
      } catch (dbErr) {
        // Non-fatal — log and continue
        console.error('[AI] Failed to save submission:', dbErr.message)
      }
    }

    res.json({
      success: true,
      score:         result.score,
      feedback:      result.feedback,
      errors:        result.errors,
      suggestions:   result.suggestions,
      optimizedCode: result.optimizedCode,
      passed,
    })
  } catch (e) {
    next(e)
  }
}

module.exports = { evaluateCodeController, aiEvaluateValidators }
