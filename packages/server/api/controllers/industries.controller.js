/* TODO: This is an example controller to illustrate a server side controller.
Can be deleted as soon as the first real controller is added. */

const knex = require('../../config/db');

const getIndustries = async () => {
  try {
    const industries = await knex('industries');
    return industries;
  } catch (error) {
    return error.message;
  }
};

const getIndustriesByApp = async (app) => {
  try {
    const industries = await knex('industries')
      .select('industries.*')
      .join(
        'industriesApps',
        'industriesApps.industry_id',
        '=',
        'industries.id',
      )
      .join('apps', 'industriesApps.app_id', '=', 'apps.id')
      .where({ app_id: app });
    return industries;
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  getIndustries,
  getIndustriesByApp,
};
