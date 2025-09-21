/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable new-cap */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
require('dotenv').config();
const cheerio = require('cheerio');

const listOfPages1 = ['ai-chatbots-and-tools', 'arts-and-entertainment'];

const listOfPages = [
  '',
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

async function scrapeSimilarWebTrending() {
  const allSites = [];

  for (const page of listOfPages) {
    const url = page
      ? `https://www.similarweb.com/top-websites/${page}/trending/`
      : 'https://www.similarweb.com/top-websites/trending/';

    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36',
        },
      });

      const html = await res.text();
      const $ = cheerio.load(html);

      // Trending Up
      $('div.top-widget[data-test="rising-players"]').each((i, el) => {
        $(el)
          .find('tbody tr')
          .each((j, row) => {
            const site = $(row)
              .find('td:nth-child(2) .top-widget__table-domain')
              .text()
              .trim();
            if (site) allSites.push({ appUrl: site });
          });
      });

      // Joined Top 100
      $('div.top-widget[data-test="joined-the-top-100"]').each((i, el) => {
        $(el)
          .find('tbody tr')
          .each((j, row) => {
            const site = $(row)
              .find('td:nth-child(2) .top-widget__table-domain')
              .text()
              .trim();
            if (site) allSites.push({ appUrl: site });
          });
      });

      console.log(allSites);
    } catch (err) {
      console.error('Scraping failed:', err.message);
    }
  }

  return allSites;
}

module.exports = scrapeSimilarWebTrending;
