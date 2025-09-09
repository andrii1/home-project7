/* TODO: This is just an example file to illustrate API routing and
documentation. Can be deleted when the first real route is added. */

const express = require('express');

const router = express.Router({ mergeParams: true });

// controllers
const industriesController = require('../controllers/industries.controller');

router.get('/', (req, res, next) => {
  if (req.query.app) {
    industriesController
      .getIndustriesByApp(req.query.app)
      .then((result) => res.json(result))
      .catch(next);
  } else {
    industriesController
      .getIndustries()
      .then((result) => res.json(result))
      .catch(next);
  }
});

module.exports = router;
