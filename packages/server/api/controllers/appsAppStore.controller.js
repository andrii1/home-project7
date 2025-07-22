/* eslint-disable import/no-extraneous-dependencies */
/* TODO: This is an example controller to illustrate a server side controller.
Can be deleted as soon as the first real controller is added. */

const HttpError = require('../lib/utils/http-error');

const getappAppStoreById = async (id) => {
  if (!id) {
    throw new HttpError('Id should be a number', 400);
  }
  try {
    const url = `https://itunes.apple.com/lookup?id=${id}`;
    const response = await fetch(url);
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  getappAppStoreById,
};
