/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable import/no-extraneous-dependencies */
require('dotenv').config();
const OpenAI = require('openai');
const store = require('app-store-scraper');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // make sure this is set in your .env
});

// Credentials (from .env)
const USER_UID = process.env.USER_UID_APPS_PROD;
const API_PATH = process.env.API_PATH_APPS_PROD;

const today = new Date();
const isSunday = today.getDay() === 0; // 0 = Sunday

if (!isSunday) {
  console.log('Not Sunday, skipping weekly job.');
  process.exit(0);
}

// fetch helpers

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

    // const deal = `${newAppTitle} referral codes`;

    // const match = newAppTitle.match(/^(.*?)(?:-|:)/);
    // const appName = match ? match[1].trim() : newAppTitle;
    // const deal = `${appName} referral codes`;

    // const newDeal = await insertDeal(deal, appleId, appId);
    // const { dealId } = newDeal;
    // console.log('Inserted deal:', newDeal);

    // const newCode = await insertCode(code, dealId);
    // const codeId = newCode.codeId;
    // console.log("Inserted code:", newCode);
  }
};

// insertApps(apps).catch(console.error);

// Promise.all([
//   store.list({
//     collection: store.collection.TOP_GROSSING_IOS,
//     num: 10,
//   }),
// ])
//   .then((results) => {
//     const allApps = results.flat(); // flatten arrays into one
//     return insertApps(allApps);
//   })
//   .catch(console.log); // eslint-disable-line no-console

Promise.all([
  store.list({
    collection: store.collection.TOP_FREE_IOS,
    num: 200,
  }),
  store.list({
    collection: store.collection.TOP_GROSSING_IOS,
    num: 100,
  }),
  store.list({
    collection: store.collection.TOP_PAID_IOS,
    num: 100,
  }),
  store.list({
    collection: store.collection.TOP_FREE_IOS,
    category: store.category.ENTERTAINMENT,
    num: 150,
  }),
  store.list({
    collection: store.collection.TOP_FREE_IOS,
    category: store.category.FINANCE,
    num: 150,
  }),
  store.list({
    collection: store.collection.TOP_FREE_IOS,
    category: store.category.LIFESTYLE,
    num: 100,
  }),
  store.list({
    collection: store.collection.TOP_FREE_IOS,
    category: store.category.PHOTO_AND_VIDEO,
    num: 150,
  }),
  store.list({
    collection: store.collection.TOP_FREE_IOS,
    category: store.category.SOCIAL_NETWORKING,
    num: 150,
  }),
  store.list({
    collection: store.collection.TOP_FREE_IOS,
    category: store.category.HEALTH_AND_FITNESS,
    num: 150,
  }),
  store.list({
    collection: store.collection.TOP_FREE_IOS,
    category: store.category.MUSIC,
    num: 150,
  }),
  store.list({
    collection: store.collection.TOP_FREE_IOS,
    category: store.category.PRODUCTIVITY,
    num: 150,
  }),
  store.list({
    collection: store.collection.TOP_FREE_IOS,
    category: store.category.BUSINESS,
    num: 150,
  }),
  store.list({
    collection: store.collection.TOP_FREE_IOS,
    category: store.category.TRAVEL,
    num: 150,
  }),
  store.list({
    collection: store.collection.TOP_FREE_IOS,
    category: store.category.UTILITIES,
    num: 150,
  }),
])
  .then((results) => {
    const allApps = results.flat(); // flatten arrays into one
    return insertApps(allApps);
  })
  .catch(console.log); // eslint-disable-line no-console
