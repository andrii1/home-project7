/* eslint-disable import/no-extraneous-dependencies */
/* TODO: This is an example controller to illustrate a server side controller.
Can be deleted as soon as the first real controller is added. */

const HttpError = require('../lib/utils/http-error');
const store = require('app-store-scraper');

const getAppAppStoreScraperById = async (id) => {
  if (!id) {
    throw new HttpError('Id should be a number', 400);
  }
  try {
    const result = await store.app({ id });
    // const response = await fetch(url);
    // const jsonResponse = await response.json();
    return result;
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  getAppAppStoreScraperById,
};
