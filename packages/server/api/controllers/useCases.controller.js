/* TODO: This is an example controller to illustrate a server side controller.
Can be deleted as soon as the first real controller is added. */

const knex = require('../../config/db');

const getUseCases = async () => {
  try {
    const useCases = await knex('useCases');
    return useCases;
  } catch (error) {
    return error.message;
  }
};

const getUseCasesByApp = async (app) => {
  try {
    const useCases = await knex('useCases')
      .select('useCases.*')
      .join('useCasesApps', 'useCasesApps.useCase_id', '=', 'useCases.id')
      .join('apps', 'useCasesApps.app_id', '=', 'apps.id')
      .where({ app_id: app });
    return useCases;
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  getUseCases,
  getUseCasesByApp,
};
