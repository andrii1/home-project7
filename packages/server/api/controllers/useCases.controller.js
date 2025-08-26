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

module.exports = {
  getUseCases,
};
