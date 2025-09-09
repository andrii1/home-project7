/* TODO: This is just an example file to illustrate API routing and
documentation. Can be deleted when the first real route is added. */

const express = require('express');

const router = express.Router({ mergeParams: true });

// controllers
const featuresController = require('../controllers/features.controller');

router.get('/', (req, res, next) => {
  if (req.query.app) {
    featuresController
      .getFeaturesByApp(req.query.app)
      .then((result) => res.json(result))
      .catch(next);
  } else {
    featuresController
      .getFeatures()
      .then((result) => res.json(result))
      .catch(next);
  }
});

module.exports = router;
