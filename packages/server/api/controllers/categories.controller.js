/* TODO: This is an example controller to illustrate a server side controller.
Can be deleted as soon as the first real controller is added. */

const knex = require('../../config/db');
const HttpError = require('../lib/utils/http-error');

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

const createCategory = async (token, body) => {
  try {
    const userUid = token.split(' ')[1];
    const user = (await knex('users').where({ uid: userUid }))[0];
    if (!user) {
      throw new HttpError('User not found', 401);
    }

    // Optional: check for existing author
    const existing = await knex('categories')
      .whereRaw('LOWER(title) = ?', [body.title.toLowerCase()])
      .first();

    if (existing) {
      return {
        successful: true,
        existing: true,
        categoryId: existing.id,
        categoryTitle: body.title,
      };
    }

    const insertData = {
      title: body.title,
    };

    if (body.category_apple_id) {
      insertData.category_apple_id = body.category_apple_id;
    }

    const [categoryId] = await knex('categories').insert(insertData);

    return {
      successful: true,
      categoryId,
      categoryTitle: body.title,
    };
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  getCategories,
  createCategory,
};
