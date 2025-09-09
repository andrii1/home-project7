/* TODO: This is an example controller to illustrate a server side controller.
Can be deleted as soon as the first real controller is added. */

const knex = require('../../config/db');

const getUserTypes = async () => {
  try {
    const userTypes = await knex('userTypes');

    return userTypes;
  } catch (error) {
    return error.message;
  }
};

const getUserTypesByApp = async (app) => {
  try {
    const userTypes = await knex('userTypes')
      .select('userTypes.*')
      .join('userTypesApps', 'userTypesApps.userType_id', '=', 'userTypes.id')
      .join('apps', 'userTypesApps.app_id', '=', 'apps.id')
      .where({ app_id: app });
    return userTypes;
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  getUserTypes,
  getUserTypesByApp,
};
