/* eslint-disable import/no-extraneous-dependencies */
/* TODO: This is an example controller to illustrate a server side controller.
Can be deleted as soon as the first real controller is added. */
const generateSlug = require('../lib/utils/generateSlug');
const { normalizeUrl } = require('../lib/utils/normalizeUrl');

const knex = require('../../config/db');
const HttpError = require('../lib/utils/http-error');
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

const getAppsByTag = async (page, column, direction, tag) => {
  const lastItemDirection = getOppositeOrderDirection(direction);
  try {
    const getModel = () =>
      knex('apps')
        .select(
          'apps.*',
          'categories.title as categoryTitle',
          'tags.id as tagId',
          'tags.slug as tagSlug',
          'tags.title as tagTitle',
        )
        .join('categories', 'apps.category_id', '=', 'categories.id')
        .join('tagsApps', 'tagsApps.app_id', '=', 'apps.id')
        .join('tags', 'tags.id', '=', 'tagsApps.tag_id')
        .where('tags.slug', '=', `${tag}`);
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
  search,
  tags,
  features,
  userTypes,
  businessModels,
  useCases,
  industries,
}) => {
  const lastItemDirection = getOppositeOrderDirection(direction);
  try {
    const getModel = () =>
      knex('apps')
        .select('apps.*', 'categories.title as categoryTitle')
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
            queryBuilder.where(function () {
              this.whereNotNull('apps.url_x').orWhereNotNull(
                'apps.url_discord',
              );
            });
          }
          if (search !== undefined) {
            queryBuilder.where(function () {
              this.where('apps.description', 'like', `%${search}%`);
            });
          }
          if (tags !== undefined) {
            const tagsArray = tags.split(',');
            queryBuilder.whereIn('apps.id', function () {
              this.select('app_id')
                .from('tagsApps')
                .whereIn('tag_id', tagsArray);
            });
          }

          if (features !== undefined) {
            const featuresArray = features.split(',');
            queryBuilder.whereIn('apps.id', function () {
              this.select('app_id')
                .from('featuresApps')
                .whereIn('feature_id', featuresArray);
            });
          }
          if (userTypes !== undefined) {
            const userTypesArray = userTypes.split(',');
            queryBuilder.whereIn('apps.id', function () {
              this.select('app_id')
                .from('userTypesApps')
                .whereIn('userType_id', userTypesArray);
            });
          }
          if (businessModels !== undefined) {
            const businessModelsArray = businessModels.split(',');
            queryBuilder.whereIn('apps.id', function () {
              this.select('app_id')
                .from('businessModelsApps')
                .whereIn('businessModel_id', businessModelsArray);
            });
          }
          if (useCases !== undefined) {
            const useCasesArray = useCases.split(',');
            queryBuilder.whereIn('apps.id', function () {
              this.select('app_id')
                .from('useCasesApps')
                .whereIn('useCase_id', useCasesArray);
            });
          }
          if (industries !== undefined) {
            const industriesArray = industries.split(',');
            queryBuilder.whereIn('apps.id', function () {
              this.select('app_id')
                .from('industriesApps')
                .whereIn('industry_id', industriesArray);
            });
          }
        });
    const lastItem = await getModel()
      .orderBy(column, lastItemDirection)
      .limit(1);
    const data = await getModel()
      .orderBy(column, direction)
      .offset(page * 10)
      .limit(10);
    // .select();
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

    const promptTags = `Create 3-4 tags for this app: "${body.title}"${
      body.url ? ` with website ${body.url}` : ''
    }. Tag should be without hashtag, can be multiple words, which describes the app or it can be app topic. Tag shouldn't contain word 'app'. Return tags separated by comma.`;

    const completionTags = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: promptTags }],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const tagsString = completionTags.choices[0].message.content.trim();

    const tagsArray = tagsString
      .split(',')
      .map((tag) => (typeof tag === 'string' ? tag.trim() : null))
      .filter(Boolean);

    if (body.tag) {
      tagsArray.push(body.tag);
    }

    const tagIds = await Promise.all(
      tagsArray.map(async (tag) => {
        const existingTag = await knex('tags')
          .whereRaw('LOWER(title) = ?', [tag.toLowerCase()])
          .first();

        if (existingTag) {
          return existingTag.id;
        }
        const baseSlug = generateSlug(tag);
        const uniqueSlug = await ensureUniqueSlug(baseSlug);
        const [tagId] = await knex('tags').insert({
          title: tag,
          slug: uniqueSlug,
        }); // just use the ID
        return tagId;
      }),
    );

    if (body.apple_id) {
      const url = `https://itunes.apple.com/lookup?id=${body.apple_id}`;
      const response = await fetch(url);
      const data = await response.json();
      const { description } = data.results[0];
      const urlIcon = data.results[0].artworkUrl512;
      const urlAppleId = data.results[0].sellerUrl;
      const normalizedUrlAppleId = normalizeUrl(urlAppleId);

      const promptFeatures = `Create 3-4 features for this app: "${body.title}" with website ${urlAppleId} and description: "${description}". E.g. Task management, Real-time chat, Analytics dashboard, Export to CSV, API access, etc. Feature should be without hashtag, can be multiple words. Feature shouldn't contain word 'feature'. Return features separated by comma.`;

      const promptUserTypes = `Create 1-4 user types / target audiences for this app: "${body.title}" with website ${urlAppleId} and description: "${description}". * E.g. Individuals, Teams, Students, Startups, Enterprises etc. User type should be without hashtag, can be multiple words. User types shouldn't contain word 'user type'. Return user types separated by comma.`;

      const promptBusinessModels = `Create 1-4 business models for this app: "${body.title}" with website ${urlAppleId} and description: "${description}". E.g. SaaS, Marketplace, Directory, Tool, Plugin, API, etc. Business model should be without hashtag, can be multiple words. Business model shouldn't contain word 'business model'. Return business models separated by comma.`;

      const promptUseCases = `Create 3-4 use cases for this app: "${body.title}" with website ${urlAppleId} and description: "${description}". E.g. Social media automation, Time tracking, Resume building, Text summarization, etc. Use case should be without hashtag, can be multiple words. Use case shouldn't contain word 'use case'. Return use cases separated by comma.`;

      const promptIndustries = `Create 1-4 industries for this app: "${body.title}" with website ${urlAppleId} and description: "${description}". E.g. Healthcare, Legal, Real Estate, Content Creators, Developers, etc. Industry should be without hashtag, can be multiple words. Industry shouldn't contain word 'industry'. Return industries separated by comma.`;

      // features
      const completionFeatures = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: promptFeatures }],
        temperature: 0.7,
        max_tokens: 3000,
      });

      const featuresString =
        completionFeatures.choices[0].message.content.trim();

      const featuresArray = featuresString
        .split(',')
        .map((tag) => (typeof tag === 'string' ? tag.trim() : null))
        .filter(Boolean);

      const featuresIds = await Promise.all(
        featuresArray.map(async (feature) => {
          const existingFeature = await knex('features')
            .whereRaw('LOWER(title) = ?', [feature.toLowerCase()])
            .first();

          if (existingFeature) {
            return existingFeature.id;
          }

          const [featureId] = await knex('features').insert({
            title: feature,
          }); // just use the ID
          return featureId;
        }),
      );

      // userTypes
      const completionUserTypes = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: promptUserTypes }],
        temperature: 0.7,
        max_tokens: 3000,
      });

      const userTypesString =
        completionUserTypes.choices[0].message.content.trim();

      const userTypesArray = userTypesString
        .split(',')
        .map((tag) => (typeof tag === 'string' ? tag.trim() : null))
        .filter(Boolean);

      const userTypesIds = await Promise.all(
        userTypesArray.map(async (userType) => {
          const existingUserType = await knex('userTypes')
            .whereRaw('LOWER(title) = ?', [userType.toLowerCase()])
            .first();

          if (existingUserType) {
            return existingUserType.id;
          }

          const [userTypeId] = await knex('userTypes').insert({
            title: userType,
          }); // just use the ID
          return userTypeId;
        }),
      );

      // businessModels
      const completionBusinessModels = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: promptBusinessModels }],
        temperature: 0.7,
        max_tokens: 3000,
      });

      const businessModelsString =
        completionBusinessModels.choices[0].message.content.trim();

      const businessModelsArray = businessModelsString
        .split(',')
        .map((tag) => (typeof tag === 'string' ? tag.trim() : null))
        .filter(Boolean);

      const businessModelsIds = await Promise.all(
        businessModelsArray.map(async (businessModel) => {
          const existingBusinessModel = await knex('businessModels')
            .whereRaw('LOWER(title) = ?', [businessModel.toLowerCase()])
            .first();

          if (existingBusinessModel) {
            return existingBusinessModel.id;
          }

          const [businessModelId] = await knex('businessModels').insert({
            title: businessModel,
          }); // just use the ID
          return businessModelId;
        }),
      );

      // useCases
      const completionUseCases = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: promptUseCases }],
        temperature: 0.7,
        max_tokens: 3000,
      });

      const useCasesString =
        completionUseCases.choices[0].message.content.trim();

      const useCasesArray = useCasesString
        .split(',')
        .map((tag) => (typeof tag === 'string' ? tag.trim() : null))
        .filter(Boolean);

      const useCasesIds = await Promise.all(
        useCasesArray.map(async (useCase) => {
          const existingUseCase = await knex('useCases')
            .whereRaw('LOWER(title) = ?', [useCase.toLowerCase()])
            .first();

          if (existingUseCase) {
            return existingUseCase.id;
          }

          const [useCaseId] = await knex('useCases').insert({
            title: useCase,
          }); // just use the ID
          return useCaseId;
        }),
      );

      // industries
      const completionIndustries = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: promptIndustries }],
        temperature: 0.7,
        max_tokens: 3000,
      });

      const industriesString =
        completionIndustries.choices[0].message.content.trim();

      const industriesArray = industriesString
        .split(',')
        .map((tag) => (typeof tag === 'string' ? tag.trim() : null))
        .filter(Boolean);

      const industriesIds = await Promise.all(
        industriesArray.map(async (industry) => {
          const existingIndustry = await knex('industries')
            .whereRaw('LOWER(title) = ?', [industry.toLowerCase()])
            .first();

          if (existingIndustry) {
            return existingIndustry.id;
          }

          const [industryId] = await knex('industries').insert({
            title: industry,
          }); // just use the ID
          return industryId;
        }),
      );

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

      const insertedAppToTags = await Promise.all(
        tagIds.map((tagId) =>
          knex('tagsApps').insert({
            app_id: appId,
            tag_id: tagId,
          }),
        ),
      );

      const insertedAppToFeatures = await Promise.all(
        featuresIds.map((featureId) =>
          knex('featuresApps').insert({
            app_id: appId,
            feature_id: featureId,
          }),
        ),
      );

      const insertedAppToUserTypes = await Promise.all(
        userTypesIds.map((userTypeId) =>
          knex('userTypesApps').insert({
            app_id: appId,
            userType_id: userTypeId,
          }),
        ),
      );

      const insertedAppToBusinessModels = await Promise.all(
        businessModelsIds.map((businessModelId) =>
          knex('businessModelsApps').insert({
            app_id: appId,
            businessModel_id: businessModelId,
          }),
        ),
      );

      const insertedAppToUseCases = await Promise.all(
        useCasesIds.map((useCaseId) =>
          knex('useCasesApps').insert({
            app_id: appId,
            useCase_id: useCaseId,
          }),
        ),
      );

      const insertedAppToIndustries = await Promise.all(
        industriesIds.map((industryId) =>
          knex('industriesApps').insert({
            app_id: appId,
            industry_id: industryId,
          }),
        ),
      );

      return {
        successful: true,
        appId,
        appTitle: body.title,
        appAppleId: body.apple_id,
        insertedAppToTags,
        insertedAppToFeatures,
        insertedAppToUserTypes,
        insertedAppToBusinessModels,
        insertedAppToUseCases,
        insertedAppToIndustries,
      };
    }

    // Generate a short description using OpenAI
    const prompt = `Write a short, engaging description for app "${
      body.title
    }"${body.url ? ` with website ${body.url}` : ''}.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const descContent = completion.choices[0].message.content;

    const description = descContent.trim();

    const [appId] = await knex('apps').insert({
      title: body.title,
      category_id: body.category_id,
      url: normalizedUrl,
      description,
    });

    const insertedAppToTags = await Promise.all(
      tagIds.map((tagId) =>
        knex('tagsApps').insert({
          app_id: appId,
          tag_id: tagId,
        }),
      ),
    );

    return {
      successful: true,
      appId,
      appTitle: body.title,
      url: body.url,
      insertedAppToTags,
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
  getAppsByTag,
};
