/* eslint-disable import/no-extraneous-dependencies */
/* TODO: This is an example controller to illustrate a server side controller.
Can be deleted as soon as the first real controller is added. */

const HttpError = require('../lib/utils/http-error');
// const { normalizeUrl } = require('../lib/utils/normalizeUrl');

const normalizeUrl = (siteUrl) => {
  if (!/^https?:\/\//i.test(siteUrl)) {
    return `https://${siteUrl}`;
  }
  return siteUrl;
};

const getAppleIdByUrl = async (siteUrl) => {
  if (!siteUrl) {
    throw new HttpError('Site URL is required', 400);
  }

  try {
    const siteToFetch = normalizeUrl(siteUrl);

    const response = await fetch(siteToFetch);
    if (!response.ok) {
      throw new HttpError(
        `Failed to fetch site: ${response.status}`,
        response.status,
      );
    }

    const html = await response.text();

    // Look for direct App Store links
    const linkMatch = html.match(/https:\/\/apps\.apple\.com\/[^\s"]*id(\d+)/i);
    if (linkMatch) {
      return linkMatch[1];
    }

    // Look for meta tags like <meta property="al:ios:app_store_id" content="1234567890">
    const metaMatch = html.match(/al:ios:app_store_id"[^>]*content="(\d+)"/i);
    if (metaMatch) {
      return metaMatch[1];
    }

    return null; // No Apple ID found
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  getAppleIdByUrl,
};
