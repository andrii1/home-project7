/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable new-cap */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
const OpenAI = require('openai');
require('dotenv').config();
const snoowrap = require('snoowrap');
const { jsonrepair } = require('jsonrepair');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // make sure this is set in your .env
});

const reddit = new snoowrap({
  userAgent: process.env.REDDIT_USER_AGENT,
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD,
});

function cleanOpenAIJsonReply(reply) {
  // Remove ```json or ``` at start and ``` at end, if present
  const cleaned = reply
    .replace(/^```json\s*/, '') // remove ```json at start
    .replace(/^```\s*/, '') // remove ``` at start (fallback)
    .replace(/```$/, '') // remove ``` at end
    .trim();

  return cleaned;
}

const listOfSubreddits = ['InternetIsBeautiful', 'coolguides', 'SideProject'];

async function fetchRedditWithApi() {
  const allPosts = [];

  for (const subredditName of listOfSubreddits) {
    try {
      const subreddit = await reddit.getSubreddit(subredditName);
      const posts = await subreddit.getTop({ time: 'week', limit: 30 });

      const postsMap = posts.map((post) => ({
        title: post.title,
        author: post.author.name,
        selftext: post.selftext,
        upvotes: post.ups,
        created_utc: post.created_utc,
        subreddit: subredditName,
      }));

      allPosts.push(...postsMap);
    } catch (err) {
      console.error(`Failed to fetch from r/${subredditName}:`, err.message);
    }
  }

  return allPosts;
}

async function formatReddit() {
  // Generate a short description using OpenAI

  const posts = await fetchRedditWithApi();
  const prompt = `${JSON.stringify(
    posts,
  )} Here are top Reddit posts about trending apps and websites. You should extract url of website, not url of reddit comment. Do not include links to github or apps.apple.com. Return JSON:
[{
  "appUrl": url of the app/site,
}]
Respond ONLY with valid JSON. `;
  // console.log(prompt);

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 600,
  });

  const rawReply = completion.choices[0].message.content.trim();
  const cleanedReply = cleanOpenAIJsonReply(rawReply);

  try {
    const repairedJson = jsonrepair(cleanedReply);
    const parsed = JSON.parse(repairedJson);

    // Normalize: if first element is an array and rest is noise, unwrap it
    if (Array.isArray(parsed) && Array.isArray(parsed[0])) {
      return parsed[0];
    }

    // If it's an array of objects, as expected
    if (Array.isArray(parsed)) {
      return parsed;
    }

    console.warn('Unexpected format from OpenAI:', parsed);
    return [];
  } catch (error) {
    console.error('Failed to parse OpenAI reply:', error);
    console.log('Raw reply was:', rawReply);
    return [];
  }
}

module.exports = formatReddit;
