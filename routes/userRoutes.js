const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.registerUser);
router.get('/profile/:email', userController.getUserProfile);

module.exports = router;
