const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Pages routes' });
});

module.exports = router;
