const express = require('express');
const { createShortUrl, getUrls, getUrl } = require('../controllers/urlController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/shorten', authMiddleware, createShortUrl);
router.get('/urls', authMiddleware, getUrls);
router.get('/:shortUrl', getUrl);

module.exports = router;