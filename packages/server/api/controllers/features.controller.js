/* TODO: This is an example controller to illustrate a server side controller.
Can be deleted as soon as the first real controller is added. */

const knex = require('../../config/db');

const getFeatures = async () => {
  try {
    const features = await knex('features');

    return features;
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  getFeatures,
};
