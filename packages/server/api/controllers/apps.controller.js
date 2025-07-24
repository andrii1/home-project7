/* eslint-disable import/no-extraneous-dependencies */
/* TODO: This is an example controller to illustrate a server side controller.
Can be deleted as soon as the first real controller is added. */

const knex = require('../../config/db');
const HttpError = require('../lib/utils/http-error');
const { normalizeUrl } = require('../lib/utils/normalizeUrl');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // make sure this is set in your .env
});

const getOppositeOrderDirection = (direction) => {
  let lastItemDirection;
  if (direction === 'asc') {
    lastItemDirection = 'desc';
  } else if (direction === 'desc') {
    lastItemDirection = 'asc';
  }
  return lastItemDirection;
};

const getAppsAll = async () => {
  try {
    const apps = knex('apps')
      .select('apps.*', 'categories.title as categoryTitle')
      .join('categories', 'apps.category_id', '=', 'categories.id');
    return apps;
  } catch (error) {
    return error.message;
  }
};

const getApps = async (page, column, direction) => {
  const lastItemDirection = getOppositeOrderDirection(direction);
  try {
    const getModel = () =>
      knex('apps')
        .select('apps.*', 'categories.title as categoryTitle')
        .join('categories', 'apps.category_id', '=', 'categories.id');
    const lastItem = await getModel()
      .orderBy(column, lastItemDirection)
      .limit(1);
    const data = await getModel()
      .orderBy(column, direction)
      .offset(page * 10)
      .limit(10)
      .select();
    return {
      lastItem: lastItem[0],
      data,
    };
  } catch (error) {
    return error.message;
  }
};

const getAppsPagination = async (column, direction, page, size) => {
  try {
    const getModel = () =>
      knex('apps')
        .select('apps.*', 'categories.title as categoryTitle')
        .join('categories', 'apps.category_id', '=', 'categories.id')
        .orderBy(column, direction);
    const totalCount = await getModel()
      .count('apps.id', { as: 'rows' })
      .groupBy('apps.id');
    const data = await getModel()
      .offset(page * size)
      .limit(size)
      .select();
    const dataExport = await getModel().select();

    return {
      totalCount: totalCount.length,
      data,
      dataExport,
    };
  } catch (error) {
    return error.message;
  }
};

const getAppsSearch = async (search, column, direction, page, size) => {
  try {
    const getModel = () =>
      knex('apps')
        .select('apps.*', 'categories.title as categoryTitle')
        .join('categories', 'apps.category_id', '=', 'categories.id')
        .orderBy(column, direction)
        .where('apps.title', 'like', `%${search}%`);
    const totalCount = await getModel()
      .count('apps.id', { as: 'rows' })
      .groupBy('apps.id');
    const data = await getModel()
      .offset(page * size)
      .limit(size)
      .select();
    const dataExport = await getModel().select();

    return {
      totalCount: totalCount.length,
      data,
      dataExport,
    };
  } catch (error) {
    return error.message;
  }
};

const getAppsByCategories = async (categories) => {
  try {
    const apps = await knex('apps')
      .select('apps.*', 'categories.title as categoryTitle')
      .join('categories', 'apps.category_id', '=', 'categories.id')
      .whereIn('category_id', categories);

    return apps;
  } catch (error) {
    return error.message;
  }
};

const getAppsByCategory = async (category, page, column, direction) => {
  const lastItemDirection = getOppositeOrderDirection(direction);
  try {
    const getModel = () =>
      knex('apps')
        .select('apps.*', 'categories.title as categoryTitle')
        .join('categories', 'apps.category_id', '=', 'categories.id')
        .where({
          'apps.category_id': category,
        });

    const lastItem = await getModel()
      .orderBy(column, lastItemDirection)
      .limit(1);
    const data = await getModel()
      .orderBy(column, direction)
      .offset(page * 10)
      .limit(10)
      .select();
    return {
      lastItem: lastItem[0],
      data,
    };
  } catch (error) {
    return error.message;
  }
};

const getAppsBy = async ({
  page,
  column,
  direction,
  filteredCategories,
  filteredPricing,
  filteredDetails,
}) => {
  const lastItemDirection = getOppositeOrderDirection(direction);
  try {
    const getModel = () =>
      knex('apps')
        .select(
          'apps.*',

          'categories.title as categoryTitle',
        )
        .join('categories', 'apps.category_id', '=', 'categories.id')
        .modify((queryBuilder) => {
          if (filteredCategories !== undefined) {
            queryBuilder.where('apps.category_id', filteredCategories);
          }
          if (filteredPricing !== undefined) {
            queryBuilder.whereIn('apps.pricing_type', filteredPricing);
          }
          if (
            filteredDetails !== undefined &&
            filteredDetails.includes('Browser extension')
          ) {
            queryBuilder.whereNotNull('apps.url_chrome_extension');
          }
          if (
            filteredDetails !== undefined &&
            filteredDetails.includes('iOS app available')
          ) {
            queryBuilder.whereNotNull('apps.url_app_store');
          }
          if (
            filteredDetails !== undefined &&
            filteredDetails.includes('Android app available')
          ) {
            queryBuilder.whereNotNull('apps.url_google_play_store');
          }

          if (
            filteredDetails !== undefined &&
            filteredDetails.includes('Social media contacts')
          ) {
            queryBuilder
              .whereNotNull('apps.url_x')
              .orWhereNotNull('apps.url_discord');
          }
        });
    const lastItem = await getModel()
      .orderBy(column, lastItemDirection)
      .limit(1);
    const data = await getModel()
      .orderBy(column, direction)
      .offset(page * 10)
      .limit(10)
      .select();
    return {
      lastItem: lastItem[0],
      data,
    };
  } catch (error) {
    return error.message;
  }
};

// Get apps by id
const getAppById = async (id) => {
  if (!id) {
    throw new HttpError('Id should be a number', 400);
  }
  try {
    const app = await knex('apps')
      .select('apps.*', 'categories.title as categoryTitle')
      .join('categories', 'apps.category_id', '=', 'categories.id')
      .where({ 'apps.id': id });
    if (app.length === 0) {
      throw new HttpError(`incorrect entry with the id of ${id}`, 404);
    }
    return app;
  } catch (error) {
    return error.message;
  }
};

// post
// const createApps = async (token, body) => {
//   try {
//     const userUid = token.split(' ')[1];
//     const user = (await knex('users').where({ uid: userUid }))[0];
//     if (!user) {
//       throw new HttpError('User not found', 401);
//     }
//     await knex('apps').insert({
//       title: body.title,
//       description: body.description,
//       topic_id: body.topic_id,
//       user_id: user.id,
//     });
//     return {
//       successful: true,
//     };
//   } catch (error) {
//     return error.message;
//   }
// };

const createAppNode = async (token, body) => {
  try {
    const userUid = token.split(' ')[1];
    const user = (await knex('users').where({ uid: userUid }))[0];
    if (!user) {
      throw new HttpError('User not found', 401);
    }

    const normalizedUrl = body.url ? normalizeUrl(body.url) : null;

    if (body.apple_id) {
      // Check for existing app
      const existingApp = await knex('apps')
        .whereRaw('LOWER(apple_id) = ?', [body.apple_id.toLowerCase()])
        .first();

      if (existingApp) {
        return {
          successful: true,
          existing: true,
          appId: existingApp.id,
          appTitle: body.title,
          appAppleId: existingApp.apple_id,
        };
      }
    } else {
      const existingUrl = await knex('apps')
        .where({ url: normalizedUrl })
        .orWhere({ title: body.title })
        .first();

      if (existingUrl) {
        return {
          successful: true,
          existing: true,
          appId: existingUrl.id,
          appTitle: body.title,
          url: normalizedUrl,
        };
      }
    }

    // const existingTopic = await knex('topics')
    //   .whereRaw('LOWER(title) = ?', [body.topicTitle.toLowerCase()])
    //   .first();

    // let topicId;

    // if (existingTopic) {
    //   topicId = existingTopic.id;
    // } else {
    //   const [newTopic] = await knex('topics').insert({
    //     title: body.topicTitle,
    //   });
    //   topicId = newTopic;
    // }
    if (body.apple_id) {
      const url = `https://itunes.apple.com/lookup?id=${body.apple_id}`;
      const response = await fetch(url);
      const data = await response.json();
      const { description } = data.results[0];
      const urlIcon = data.results[0].artworkUrl512;
      const urlAppleId = data.results[0].sellerUrl;
      const normalizedUrlAppleId = normalizeUrl(urlAppleId);

      let appId;
      if (body.url) {
        [appId] = await knex('apps').insert({
          title: body.title,
          category_id: body.category_id,
          apple_id: body.apple_id,
          description,
          url: normalizedUrl,
          url_icon: urlIcon,
        });
      } else {
        [appId] = await knex('apps').insert({
          title: body.title,
          category_id: body.category_id,
          apple_id: body.apple_id,
          description,
          url: normalizedUrlAppleId,
          url_icon: urlIcon,
        });
      }

      return {
        successful: true,
        appId,
        appTitle: body.title,
        appAppleId: body.apple_id,
      };
    }

    // Generate a short description using OpenAI
    const prompt = `Write a short, engaging description for app "${body.title}" with website "${body.url}".`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const description = completion.choices[0].message.content.trim();

    const [appId] = await knex('apps').insert({
      title: body.title,
      category_id: body.category_id,
      url: normalizedUrl,
      description,
    });

    return {
      successful: true,
      appId,
      appTitle: body.title,
      url: body.url,
    };
  } catch (error) {
    return error.message;
  }
};

// edit
const editApp = async (token, updatedAppId, body) => {
  try {
    const userUid = token.split(' ')[1];
    const user = (await knex('users').where({ uid: userUid }))[0];
    if (!user) {
      throw new HttpError('User not found', 401);
    }

    if (!updatedAppId) {
      throw new HttpError('updatedAppId should be a number', 400);
    }

    await knex('apps').where({ id: updatedAppId }).update({
      description: body.description,
    });

    return {
      successful: true,
    };
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  getApps,
  getAppsPagination,
  getAppsSearch,
  getAppsByCategories,
  getAppsBy,
  getAppsByCategory,
  getAppById,
  getAppsAll,
  // createApps,
  editApp,
  createAppNode,
};
