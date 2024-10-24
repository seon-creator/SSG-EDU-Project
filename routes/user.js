// routes/user.js
const express = require('express');
const { getUserInfo } = require('../controllers/userController');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();



module.exports = router;