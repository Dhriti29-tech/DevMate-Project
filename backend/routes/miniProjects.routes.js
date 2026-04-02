const express = require('express');
const { body } = require('express-validator');
const { getUserProjects, saveCode, submitProject, moreProjects } = require('../controllers/miniProjectsController');
const { authMiddleware } = require('../middleware/authMiddleware');
const validate           = require('../middleware/validate');
const asyncHandler       = require('../middleware/asyncHandler');

const router = express.Router();
router.use(authMiddleware);

router.get('/user/:language',  asyncHandler(getUserProjects));
router.post('/save-code',
  [body('language').notEmpty(), body('projectId').notEmpty(), body('code').isString()],
  validate, asyncHandler(saveCode));
router.post('/submit',
  [body('language').notEmpty(), body('projectId').notEmpty()],
  validate, asyncHandler(submitProject));
router.post('/more',
  [body('language').notEmpty()],
  validate, asyncHandler(moreProjects));

module.exports = router;
