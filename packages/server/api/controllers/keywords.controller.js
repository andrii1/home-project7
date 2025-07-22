/* TODO: This is an example controller to illustrate a server side controller.
Can be deleted as soon as the first real controller is added. */

const knex = require('../../config/db');

/* Get all topics */
const getKeywords = async () => {
  try {
    const keywords = await knex('keywords');
    return keywords;
  } catch (error) {
    return error.message;
  }
};

// Get topics by Category
const getKeywordsByApp = async (deal) => {
  try {
    const topics = await knex('keywords')
      .select('keywords.*')
      .join('apps', 'keywords.app_id', '=', 'app.id')
      .where({ app_id: app });
    return topics;
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  getKeywords,
  getKeywordsByApp,
};
