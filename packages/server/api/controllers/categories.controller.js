/* TODO: This is an example controller to illustrate a server side controller.
Can be deleted as soon as the first real controller is added. */

const knex = require('../../config/db');

const getCategories = async () => {
  try {
    const categories = await knex('categories')
      .select('categories.*')
      .distinct('categories.id')
      .join('topics', 'topics.category_id', '=', 'categories.id')
      .join('apps', 'apps.topic_id', '=', 'topics.id')
      .orderBy('categories.title');
    return categories;
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  getCategories,
};
