/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable new-cap */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
const OpenAI = require('openai');
require('dotenv').config();
const { jsonrepair } = require('jsonrepair');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // make sure this is set in your .env
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

async function formatChatGpt() {
  // Generate a short description using OpenAI

  const prompt = `Create a list of 50 trending apps and websites. Focus on app/sites popular among teenagers/gen Z. Try also to include some niche apps/websites, which are growing in popularity. Return JSON:
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

module.exports = formatChatGpt;
