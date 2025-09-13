/* TODO: This is just an example file to illustrate API routing and
documentation. Can be deleted when the first real route is added. */

const express = require('express');

const router = express.Router({ mergeParams: true });

// controllers
const appsAppStoreScraperController = require('../controllers/appsAppStoreScraper.controller');

// router.get('/', (req, res, next) => {
//   appsAppStoreController
//     .getExampleResources()
//     .then((result) => res.json(result))
//     .catch(next);
// });

router.get('/:id', (req, res, next) => {
  appsAppStoreScraperController
    .getAppAppStoreScraperById(req.params.id)
    .then((result) => res.json(result))
    .catch(next);
});

module.exports = router;
