const express = require('express');
const router = express.Router();

// Home route
router.get('/', (req, res) => {
  res.send('Welcome to Gola - Azure Migration Successful!');
});

module.exports = router;
