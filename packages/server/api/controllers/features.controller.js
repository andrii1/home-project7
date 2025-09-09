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

const getFeaturesByApp = async (app) => {
  try {
    const features = await knex('features')
      .select('features.*')
      .join('featuresApps', 'featuresApps.feature_id', '=', 'features.id')
      .join('apps', 'featuresApps.app_id', '=', 'apps.id')
      .where({ app_id: app });
    return features;
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  getFeatures,
  getFeaturesByApp,
};
