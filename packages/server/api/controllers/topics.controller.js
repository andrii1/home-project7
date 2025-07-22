/* TODO: This is an example controller to illustrate a server side controller.
Can be deleted as soon as the first real controller is added. */

const knex = require('../../config/db');
const HttpError = require('../lib/utils/http-error');

/* Get all topics */
const getTopics = async () => {
  try {
    const topics = await knex('topics')
      .select(
        'topics.id as id',
        'topics.title as title',
        'topics.category_id as categoryId',
        'categories.title as categoryTitle',
      )
      .distinct('topics.id')
      .join('categories', 'topics.category_id', '=', 'categories.id')
      .join('apps', 'apps.topic_id', '=', 'topics.id');
    return topics;
  } catch (error) {
    return error.message;
  }
};

// Get topics by Category
const getTopicsByCategory = async (category) => {
  try {
    const topics = await knex('topics').where({ category_id: category });
    return topics;
  } catch (error) {
    return error.message;
  }
};

const createTopic = async (token, body) => {
  try {
    const userUid = token.split(' ')[1];
    const user = (await knex('users').where({ uid: userUid }))[0];
    if (!user) {
      throw new HttpError('User not found', 401);
    }

    // Optional: check for existing author
    const existing = await knex('topics')
      .whereRaw('LOWER(title) = ?', [body.title.toLowerCase()])
      .first();

    if (existing) {
      return {
        successful: true,
        existing: true,
        topicId: existing.id,
        topicTitle: body.title,
      };
    }

    // const existingCategory = await knex('categories')
    //   .whereRaw('LOWER(title) = ?', [body.categoryTitle.toLowerCase()])
    //   .first();

    // let categoryId;

    // if (existingCategory) {
    //   categoryId = existingCategory.id;
    // } else {
    //   const [newCategory] = await knex('categories').insert({
    //     title: body.categoryTitle,
    //   });
    //   categoryId = newCategory;
    // }

    const [topicId] = await knex('topics').insert({
      title: body.title,
      category_id: body.category_id,
    });

    return {
      successful: true,
      topicId,
      topicTitle: body.title,
    };
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  getTopics,
  getTopicsByCategory,
  createTopic,
};
