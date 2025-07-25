/* TODO: This is an example controller to illustrate a server side controller.
Can be deleted as soon as the first real controller is added. */

const knex = require('../../config/db');
const HttpError = require('../lib/utils/http-error');
const generateSlug = require('../lib/utils/generateSlug');

// Helper: ensure the slug is unique by checking the DB
async function ensureUniqueSlug(baseSlug) {
  let slug = baseSlug;
  let counter = 1;

  // eslint-disable-next-line no-await-in-loop
  while (await slugExists(slug)) {
    const suffix = `-${counter}`;
    const maxBaseLength = 200 - suffix.length;
    slug = `${baseSlug.slice(0, maxBaseLength)}${suffix}`;
    counter += 1;
  }

  return slug;
}

// Helper: check if a slug already exists in the database
async function slugExists(slug) {
  const existing = await knex('tags').where({ slug }).first();
  return !!existing;
}

/* Get all topics */
const getTags = async () => {
  try {
    const tags = await knex('tags');
    return tags;
  } catch (error) {
    return error.message;
  }
};

const getTagById = async (slug) => {
  if (!slug) {
    throw new HttpError('Id should be a number', 400);
  }

  try {
    const tags = await knex('tags').where({ slug });
    if (tags.length === 0) {
      throw new Error(`incorrect entry of ${slug}`, 404);
    }
    return tags;
  } catch (error) {
    return error.message;
  }
};

// Get topics by Category
const getTagsByApp = async (app) => {
  try {
    const tags = await knex('tags')
      .select('tags.*')
      .join('tagsApps', 'tagsApps.tag_id', '=', 'tags.id')
      .join('apps', 'tagsApps.app_id', '=', 'apps.id')
      .where({ app_id: app });
    return tags;
  } catch (error) {
    return error.message;
  }
};

const createTag = async (token, body) => {
  try {
    const userUid = token.split(' ')[1];
    const user = (await knex('users').where({ uid: userUid }))[0];
    if (!user) {
      throw new HttpError('User not found', 401);
    }

    // Optional: check for existing tag
    const existing = await knex('tags')
      .whereRaw('LOWER(title) = ?', [body.title.toLowerCase()])
      .first();

    if (existing) {
      return {
        successful: true,
        existing: true,
        tagId: existing.id,
      };
    }

    const baseSlug = generateSlug(body.title);
    const uniqueSlug = await ensureUniqueSlug(baseSlug);

    const [tagId] = await knex('tags').insert({
      title: body.title.toLowerCase(),
      slug: uniqueSlug,
    });

    return {
      successful: true,
      tagId,
      tagTitle: body.title,
    };
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  getTags,
  getTagById,
  getTagsByApp,
  createTag,
};
