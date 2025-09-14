/* eslint-disable prefer-destructuring */
/* eslint-disable no-return-await */
/* eslint-disable no-restricted-syntax */
const store = require('app-store-scraper');
const HttpError = require('./http-error');

function normalizeSiteUrl(siteUrl) {
  if (!siteUrl) return '';

  // Remove protocol
  let url = siteUrl.replace(/^https?:\/\//i, '');

  // Remove www.
  url = url.replace(/^www\./i, '');

  // Remove everything after first slash (ignore path)
  url = url.split('/')[0];

  return url.toLowerCase();
}

async function findAppleIdByUrl(siteUrl, siteName) {
  if (!siteUrl) throw new HttpError('Site URL is required', 400);

  const normalizedUrl = normalizeSiteUrl(siteUrl);

  const results = await store.search({
    term: siteName,
    num: 3,
    country: 'us',
    type: 'ios',
  });

  for (const app of results) {
    if (
      app.developerWebsite &&
      normalizeSiteUrl(app.developerWebsite) === normalizedUrl
    ) {
      return app.id; // or return app object if you want more metadata
    }
  }

  return null;
}

async function getAppleId(body) {
  if (body.apple_id) return body.apple_id;
  if (body.url) return await findAppleIdByUrl(body.url, body.title);
  return null;
}

module.exports = { getAppleId };
