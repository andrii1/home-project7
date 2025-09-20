/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable new-cap */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
require('dotenv').config();
const cheerio = require('cheerio');

const listOfPages1 = ['ai-chatbots-and-tools', 'arts-and-entertainment'];

const listOfPages = [
  'ai-chatbots-and-tools',
  'arts-and-entertainment',
  'business-and-consumer-services',
  'community-and-society',
  'computers-electronics-and-technology',
  'ecommerce-and-shopping',
  'finance',
  'food-and-drink',
  'gambling',
  'games',
  'health',
  'heavy-industry-and-engineering',
  'hobbies-and-leisure',
  'home-and-garden',
  'jobs-and-career',
  'law-and-government',
  'lifestyle',
  'news-and-media',
  'pets-and-animals',
  'reference-materials',
  'science-and-education',
  'sports',
  'travel-and-tourism',
  'adult',
  'vehicles',
];

async function scrapeSimilarWeb() {
  const allSites = [];

  for (const page of listOfPages) {
    const url = `https://www.similarweb.com/top-websites/${page}/`;
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36',
        },
      });

      const html = await res.text();
      const $ = cheerio.load(html);

      $('table tbody tr').each((i, el) => {
        const site = $(el).find('td:nth-child(2)').text().trim();

        if (site) {
          allSites.push({
            appUrl: site,
          });
        }
      });
    } catch (err) {
      console.error(`Failed to fetch from r/${page}:`, err.message);
    }
  }

  return allSites;
}

module.exports = scrapeSimilarWeb;
