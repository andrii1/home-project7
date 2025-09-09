/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  // MySQL/Postgres: need two steps so rename and add don't conflict
  await knex.schema.alterTable('apps', (table) => {
    // rename existing pricing columns
    table.renameColumn('pricing_free', 'pricing_ios_app_free');
    table.renameColumn('pricing_paid', 'pricing_ios_app_paid');

    // rename developer columns
    table.renameColumn('developerUrl', 'developer_url');
    table.renameColumn('developerId', 'developer_id');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  // revert renames
  await knex.schema.alterTable('apps', (table) => {
    table.renameColumn('developer_url', 'developerUrl');
    table.renameColumn('developer_id', 'developerId');

    table.renameColumn('pricing_ios_app_free', 'pricing_free');
    table.renameColumn('pricing_ios_app_paid', 'pricing_paid');
  });
};
