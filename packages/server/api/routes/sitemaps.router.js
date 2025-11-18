const express = require('express');

const router = express.Router({ mergeParams: true });
const sitemapsController = require('../controllers/sitemaps.controller');

router.get('/sitemap.xml', async (req, res, next) => {
  try {
    const xml = await sitemapsController.getSitemap();
    res.set('Content-Type', 'application/xml'); // important!
    res.send(xml);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
