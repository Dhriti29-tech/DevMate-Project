const express = require('express');
const { body } = require('express-validator');
const { listJourneyVideos, completeVideo, getLanguageStatus } = require('../controllers/journeyController');
const { authMiddleware } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.use(authMiddleware);

router.get('/videos/:playlistId',   asyncHandler(listJourneyVideos));
router.get('/status/:language',     asyncHandler(getLanguageStatus));
router.post(
  '/videos/complete',
  [body('videoId').notEmpty().withMessage('videoId is required')],
  validate,
  asyncHandler(completeVideo),
);

module.exports = router;
