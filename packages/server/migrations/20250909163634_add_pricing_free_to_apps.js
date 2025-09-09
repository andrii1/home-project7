/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  // separate alter to add the new pricing_free
  await knex.schema.alterTable('apps', (table) => {
    table.boolean('pricing_free').defaultTo(false);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  // drop the new pricing_free
  await knex.schema.alterTable('apps', (table) => {
    table.dropColumn('pricing_free');
  });
};
