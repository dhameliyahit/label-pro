const express = require('express');
const { loginUser, refreshAccessToken } = require('../controllers/auth.controller');
const router = express.Router();

router.post('/login', loginUser);
router.post('/refresh', refreshAccessToken);

module.exports = router;
