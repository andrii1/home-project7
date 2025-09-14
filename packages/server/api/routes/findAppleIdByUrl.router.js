/* TODO: This is just an example file to illustrate API routing and
documentation. Can be deleted when the first real route is added. */

const express = require('express');

const router = express.Router({ mergeParams: true });

// controllers
const findAppleIdByUrlController = require('../controllers/findAppleIdByUrl.controller');

// router.get('/', (req, res, next) => {
//   appsAppStoreController
//     .getExampleResources()
//     .then((result) => res.json(result))
//     .catch(next);
// });

router.get('/:siteUrl', (req, res, next) => {
  findAppleIdByUrlController
    .getAppleIdByUrl(req.params.siteUrl)
    .then((result) => res.json(result))
    .catch(next);
});

module.exports = router;
