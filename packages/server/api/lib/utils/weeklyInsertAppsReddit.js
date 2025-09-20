/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable import/no-extraneous-dependencies */
require('dotenv').config();
const OpenAI = require('openai');
const formatReddit = require('./scrapeReddit');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // make sure this is set in your .env
});

// Credentials (from .env)
const USER_UID = process.env.USER_UID_APPS_LOCAL;
const API_PATH = process.env.API_PATH_APPS_LOCAL;

// const today = new Date();
// const isSunday = today.getDay() === 0; // 0 = Sunday

// if (!isSunday) {
//   console.log('Not Sunday, skipping weekly job.');
//   process.exit(0);
// }

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

const insertApps = async () => {
  const scrapedWebsites = await formatReddit();
  console.log('websites', scrapedWebsites);
  for (const appItem of scrapedWebsites) {
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

insertApps()
  .then(() => {
    console.log('Done inserting apps');
    process.exit(0); // force exit Node.js after all async work done
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
