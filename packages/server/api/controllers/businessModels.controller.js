/* TODO: This is an example controller to illustrate a server side controller.
Can be deleted as soon as the first real controller is added. */

const knex = require('../../config/db');

const getBusinessModels = async () => {
  try {
    const businessModels = await knex('businessModels');

    return businessModels;
  } catch (error) {
    return error.message;
  }
};

const getBusinessModelsByApp = async (app) => {
  try {
    const businessModels = await knex('businessModels')
      .select('businessModels.*')
      .join(
        'businessModelsApps',
        'businessModelsApps.businessModel_id',
        '=',
        'businessModels.id',
      )
      .join('apps', 'businessModelsApps.app_id', '=', 'apps.id')
      .where({ app_id: app });
    return businessModels;
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  getBusinessModels,
  getBusinessModelsByApp,
};
