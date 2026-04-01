const express = require('express')
const { getMiniProjects } = require('../controllers/miniProjectsController')
const { authMiddleware } = require('../middleware/authMiddleware')
const asyncHandler = require('../middleware/asyncHandler')

const router = express.Router()

router.use(authMiddleware)
router.get('/:language', asyncHandler(getMiniProjects))

module.exports = router
