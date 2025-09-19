/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable import/no-extraneous-dependencies */
require('dotenv').config();
const OpenAI = require('openai');
const store = require('app-store-scraper');
const knex = require('../../../config/db');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // make sure this is set in your .env
});

// Credentials (from .env)
const USER_UID = process.env.USER_UID_APPS_PROD;
const API_PATH = process.env.API_PATH_APPS_PROD;
const BATCH_SIZE = 20; // number of apps per run

// const today = new Date();
// const isSunday = today.getDay() === 0; // 0 = Sunday

// if (!isSunday) {
//   console.log('Not Sunday, skipping weekly job.');
//   process.exit(0);
// }

// fetch helpers

// fetch or init offset
async function getOffset() {
  const row = await knex('app_import_batches').first('last_offset');
  if (!row) {
    await knex('app_import_batches').insert({ last_offset: 0 });
    return 0;
  }
  return row.last_offset;
}

// save new offset
async function saveOffset(offset) {
  await knex('app_import_batches').update({
    last_offset: offset,
    updated_at: knex.fn.now(),
  });
}

async function fetchAppByAppleId(appleId) {
  const url = `https://itunes.apple.com/lookup?id=${appleId}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.results[0];
}

async function insertCategory(title, categoryAppleId) {
  const res = await fetch(`${API_PATH}/categories`, {
    method: 'POST',
    headers: {
      token: `token ${USER_UID}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, category_apple_id: categoryAppleId }),
  });
  const data = await res.json();
  return data; // assume it returns { id, full_name }
}

async function insertApp({ appTitle, appleId, appUrl, categoryId }) {
  const body = {
    title: appTitle,
    category_id: categoryId,
  };

  if (appleId) {
    body.apple_id = appleId;
  }

  if (appUrl) {
    body.url = appUrl;
  }
  const res = await fetch(`${API_PATH}/apps/node`, {
    method: 'POST',
    headers: {
      token: `token ${USER_UID}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return data; // assume it returns { id, full_name }
}

const insertApps = async (appsParam) => {
  console.log(appsParam);
  for (const appItem of appsParam) {
    try {
      const appleId = appItem.id;

      const app = await fetchAppByAppleId(appleId);
      const category = app.primaryGenreName;
      const categoryAppleId = app.primaryGenreId;
      const appTitle = app.trackName;
      const appDescription = app.description;
      const appUrl = app.sellerUrl;

      const newCategory = await insertCategory(category, categoryAppleId);
      const { categoryId } = newCategory;
      console.log('Inserted category:', newCategory);

      // const createdTopic = await createTopicWithChatGpt(
      //   category,
      //   appTitle,
      //   appDescription,
      // );
      // console.log('createdTopic', createdTopic);

      // const newTopic = await insertTopic(createdTopic, categoryId);
      // const { topicId } = newTopic;
      // console.log('Inserted topic:', newTopic);

      const newApp = await insertApp({ appTitle, appleId, appUrl, categoryId });
      const { appId } = newApp;
      const newAppTitle = newApp.appTitle;
      console.log('Inserted app:', newApp);
    } catch (err) {
      console.error(`❌ Failed to insert app ${appItem.id}:`, err.message);
      // continue with next app
    }
  }
};

async function run() {
  const offset = await getOffset();
  console.log(`➡️ Starting batch at offset ${offset}`);

  // fetch app lists
  const results = await Promise.all([
    store.list({
      collection: store.collection.TOP_FREE_IOS,
      num: 200,
    }),
    store.list({
      collection: store.collection.TOP_GROSSING_IOS,
      num: 200,
    }),
    store.list({
      collection: store.collection.TOP_PAID_IOS,
      num: 200,
    }),
    store.list({
      collection: store.collection.TOP_FREE_IOS,
      category: store.category.ENTERTAINMENT,
      num: 200,
    }),
    store.list({
      collection: store.collection.TOP_FREE_IOS,
      category: store.category.FINANCE,
      num: 200,
    }),
    store.list({
      collection: store.collection.TOP_FREE_IOS,
      category: store.category.LIFESTYLE,
      num: 100,
    }),
    store.list({
      collection: store.collection.TOP_FREE_IOS,
      category: store.category.PHOTO_AND_VIDEO,
      num: 200,
    }),
    store.list({
      collection: store.collection.TOP_FREE_IOS,
      category: store.category.SOCIAL_NETWORKING,
      num: 200,
    }),
    store.list({
      collection: store.collection.TOP_FREE_IOS,
      category: store.category.HEALTH_AND_FITNESS,
      num: 200,
    }),
    store.list({
      collection: store.collection.TOP_FREE_IOS,
      category: store.category.MUSIC,
      num: 200,
    }),
    store.list({
      collection: store.collection.TOP_FREE_IOS,
      category: store.category.PRODUCTIVITY,
      num: 200,
    }),
    store.list({
      collection: store.collection.TOP_FREE_IOS,
      category: store.category.BUSINESS,
      num: 200,
    }),
    store.list({
      collection: store.collection.TOP_FREE_IOS,
      category: store.category.TRAVEL,
      num: 200,
    }),
    store.list({
      collection: store.collection.TOP_FREE_IOS,
      category: store.category.UTILITIES,
      num: 200,
    }),
    store.list({
      collection: store.collection.TOP_FREE_IOS,
      category: store.category.BOOKS,
      num: 200,
    }),
    store.list({
      collection: store.collection.TOP_FREE_IOS,
      category: store.category.EDUCATION,
      num: 200,
    }),
    store.list({
      collection: store.collection.TOP_FREE_IOS,
      category: store.category.FOOD_AND_DRINK,
      num: 200,
    }),
    store.list({
      collection: store.collection.TOP_FREE_IOS,
      category: store.category.GAMES,
      num: 200,
    }),
    store.list({
      collection: store.collection.TOP_FREE_IOS,
      category: store.category.MEDICAL,
      num: 200,
    }),
    store.list({
      collection: store.collection.TOP_FREE_IOS,
      category: store.category.REFERENCE,
      num: 200,
    }),
    store.list({
      collection: store.collection.TOP_FREE_IOS,
      category: store.category.SHOPPING,
      num: 200,
    }),
    store.list({
      collection: store.collection.TOP_FREE_IOS,
      category: store.category.SPORTS,
      num: 200,
    }),
    store.list({
      collection: store.collection.TOP_FREE_IOS,
      category: store.category.WEATHER,
      num: 200,
    }),
    store.list({
      collection: store.collection.TOP_MAC,
      num: 200,
    }),
    store.list({
      collection: store.collection.TOP_FREE_MAC,
      num: 200,
    }),
    store.list({
      collection: store.collection.TOP_FREE_IPAD,
      num: 200,
    }),
    store.list({
      collection: store.collection.TOP_FREE_IOS,
      country: 'gb',
      num: 200,
    }),
    store.list({
      collection: store.collection.TOP_FREE_IOS,
      category: store.category.SOCIAL_NETWORKING,
      num: 200,
      country: 'gb',
    }),
    store.list({
      collection: store.collection.TOP_FREE_IOS,
      category: store.category.LIFESTYLE,
      num: 100,
      country: 'gb',
    }),
    store.list({
      collection: store.collection.TOP_FREE_IOS,
      category: store.category.PHOTO_AND_VIDEO,
      num: 100,
      country: 'gb',
    }),
    store.list({
      collection: store.collection.TOP_FREE_IOS,
      country: 'de',
      num: 100,
    }),
    store.list({
      collection: store.collection.TOP_FREE_IOS,
      country: 'in',
      num: 100,
    }),
    store.list({
      collection: store.collection.TOP_FREE_IOS,
      country: 'sg',
      num: 100,
    }),
  ]);

  const allApps = results.flat();

  // slice batch
  const batch = allApps.slice(offset, offset + BATCH_SIZE);

  if (batch.length === 0) {
    console.log('✅ No more apps, resetting offset...');
    await saveOffset(0);
    // await knex.destroy();
    return;
  }

  // insert apps
  // for (const app of batch) {
  //   try {
  //     console.log(`Inserting ${app.title} (${app.id})`);
  //     // ⚡️ plug in your insertApp / insertCategory logic here
  //     // await insertAppWithCategory(app);
  //   } catch (err) {
  //     console.error(`❌ Failed to insert ${app.id}:`, err.message);
  //   }
  // }

  try {
    await insertApps(batch);
  } catch (err) {
    console.error('❌ Batch insert failed:', err.message);
  }

  // save offset
  await saveOffset(offset + BATCH_SIZE);
  console.log(`✅ Finished batch, new offset = ${offset + BATCH_SIZE}`);
  // await knex.destroy();
}

run().catch(async (err) => {
  console.error('🚨 Fatal error:', err.message);
  // await knex.destroy();
});
