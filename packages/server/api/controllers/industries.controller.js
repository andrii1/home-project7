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

module.exports = {
  getIndustries,
};
