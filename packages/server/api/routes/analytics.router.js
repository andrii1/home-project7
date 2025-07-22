/* TODO: This is just an example file to illustrate API routing and
documentation. Can be deleted when the first real route is added. */

const express = require('express');

const router = express.Router({ mergeParams: true });

// controllers
const analyticsController = require('../controllers/analytics.controller');

router.get('/', (req, res, next) => {
  if (req.query.codes) {
    analyticsController
      .getTopCodesPages()
      .then((result) => res.json(result))
      .catch(next);
  } else {
    analyticsController
      .getTopDealsPages()
      .then((result) => res.json(result))
      .catch(next);
  }
});

module.exports = router;
