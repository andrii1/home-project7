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

module.exports = {
  getUserTypes,
};
