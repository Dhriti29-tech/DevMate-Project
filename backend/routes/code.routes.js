const express = require('express');
const { body } = require('express-validator');
const {
  submitCode,
  saveDraft,
  getDraft,
  codeSubmitValidators,
} = require('../controllers/codeSubmissionController');
const validate = require('../middleware/validate');
const { authMiddleware } = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.use(authMiddleware);

// Final submission (heuristic eval + job readiness recalc)
router.post('/submit', codeSubmitValidators(), validate, asyncHandler(submitCode));

// Draft — save in-progress code without marking task complete
router.post(
  '/draft',
  [
    body('taskId').notEmpty().withMessage('taskId is required'),
    body('code').isString().withMessage('code must be a string'),
  ],
  validate,
  asyncHandler(saveDraft),
);

// Draft — load saved draft for a task
router.get('/draft/:taskId', asyncHandler(getDraft));

module.exports = router;
