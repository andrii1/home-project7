const express = require('express');

const router = express.Router();

const exampleResources = require('./exampleResources.router');
const apps = require('./apps.router');
const categories = require('./categories.router');
const users = require('./users.router');
const favorites = require('./favorites.router');
const ratings = require('./ratings.router');
const stripe = require('./stripe.router');
const comments = require('./comments.router');
const cloudinary = require('./cloudinary.router');
const appsAppStore = require('./appsAppStore.router');
// const searches = require('./searches.router');
const keywords = require('./keywords.router');
// const analytics = require('./analytics.router');
// const positiveLikes = require('./positiveLikes.router');
// const negativeLikes = require('./negativeLikes.router');
// const threads = require('./threads.router');
// const replies = require('./replies.router');
// const ratingsForThreads = require('./ratingsForThreads.router');

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      version: '1.0',
      title: 'Final project',
      description: 'API documentation for the final project',
      contact: {},
    },
    host: '',
    basePath: '/api',
  },
  securityDefinitions: {},
  apis: ['./api/routes/*.js'],
};

const swaggerDocument = swaggerJsDoc(swaggerOptions);

// Route for Swagger API Documentation
router.use('/documentation', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

router.use('/exampleResources', exampleResources);
router.use('/apps', apps);
router.use('/categories', categories);
router.use('/users', users);
router.use('/favorites', favorites);
router.use('/ratings', ratings);
router.use('/stripe', stripe);
router.use('/cloudinary', cloudinary);
router.use('/comments', comments);
router.use('/appsAppStore', appsAppStore);
// router.use('/searches', searches);
router.use('/keywords', keywords);
// router.use('/analytics', analytics);
// router.use('/positiveLikes', positiveLikes);
// router.use('/negativeLikes', negativeLikes);
// router.use('/threads', threads);
// router.use('/replies', replies);
// router.use('/ratingsForThreads', ratingsForThreads);

module.exports = router;
