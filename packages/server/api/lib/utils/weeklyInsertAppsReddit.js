/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-return-await */
/* eslint-disable no-restricted-syntax */
// const fetch = require("node-fetch");

require('dotenv').config();

const OpenAI = require('openai');
const formatReddit = require('./scrapeReddit');

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

// INSTRUCTION

// WITH CODE

// ALL FIELDS

const apps = [
  {
    appUrl: 'https://instacart.com',
  },
  {
    appUrl: 'https://instawork.com',
  },
  {
    appUrl: 'https://spotify.com',
  },
  {
    appUrl: 'https://n8n.io',
  },
  { appUrl: 'https://cnn.com/' },
  { appUrl: 'https://uber.com/' },
];

// const apps = [
//   {
//     code: "ieydypd",
//     codeUrl: "https://instawork.com/htYgsgh",
//     appleId: "6502968192",
//     appUrl: "https://instawork.com",
//     dealTitle: "Instawork promo codes",
//     dealDescription: "Description of the deal",
//     dealId: '193'
//   },
// ];

// ONLY APPLEID

// const apps = [
//   {
//     code: "ieydypd",
//     codeUrl: "https://instawork.com/htYgsgh",
//     appleId: "6502968192",
//     dealTitle: "Instawork promo codes",
//     dealDescription: "Description of the deal",
//   },
// ];

// ONLY APPURL
// const apps = [
//   {
//     code: "0dfgdfg",
//     codeUrl: "https://instawork.com/htYgsgh",
//     appUrl: "https://instawork.com",
//     dealTitle: "Instawork promo codes",
//     dealDescription: "Description of the deal",
//   },
// ];

// fetch helpers

async function fetchAppByAppleId(appleId) {
  const url = `https://itunes.apple.com/lookup?id=${appleId}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.results[0];
}

async function createWebsiteDataWithChatGpt(url) {
  // Generate a short description using OpenAI
  const prompt = `Select a category for this website: ${url}. You need to select one category from this list: "Books, Business, Catalogs, Education, Entertainment, Finance, Food and Drink, Games, Health and Fitness, Lifestyle, Medical, Music, Navigation, News, Photo and Video, Productivity, Reference, Shopping, Social Networking, Sports, Travel, Utilities, Weather". Return only category name, without any additional text, e.g. "Education."`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 300,
  });

  const promptTitle = `Get app title based on its website: ${url}. Return only app title, without any additional text, e.g. "Duolingo"`;

  const completionTitle = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: promptTitle }],
    temperature: 0.7,
    max_tokens: 300,
  });

  const promptDescription = `Create app description based on its website: ${url}.`;

  const completionDescription = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: promptDescription }],
    temperature: 0.7,
    max_tokens: 300,
  });

  const category = completion.choices[0].message.content.trim();
  const appTitle = completionTitle.choices[0].message.content.trim();
  const appDescription =
    completionDescription.choices[0].message.content.trim();
  return { category, appTitle, appDescription };
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
  return await res.json(); // assume it returns { id, full_name }
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
  return await res.json();
}

const insertApps = async () => {
  const scrapedWebsites = await formatReddit();
  console.log('websites', scrapedWebsites);
  for (const appItem of scrapedWebsites) {
    const { appleId, appUrl } = appItem;
    let app;
    let category;
    let categoryAppleId;
    let appTitle;
    let appDescription;

    if (appleId) {
      app = await fetchAppByAppleId(appleId);
      category = app.primaryGenreName;
      categoryAppleId = app.primaryGenreId;
      appTitle = app.trackName;
      appDescription = app.description;
    } else {
      ({ category, appTitle, appDescription } =
        await createWebsiteDataWithChatGpt(appUrl));
    }

    const newCategory = await insertCategory(category, categoryAppleId);
    const categoryId = newCategory.categoryId;
    console.log('Inserted category:', newCategory);

    const newApp = await insertApp({ appTitle, appleId, appUrl, categoryId });
    const appId = newApp.appId;
    const newAppTitle = newApp.appTitle;
    console.log('Inserted app:', newApp);
  }
};

insertApps().catch(console.error);
