/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.alterTable('apps', (table) => {
    table.dropColumn('topic_id');
  });

  await knex.schema.alterTable('apps', (table) => {
    table.integer('category_id').unsigned();
    table.foreign('category_id').references('id').inTable('categories');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.alterTable('apps', (table) => {
    table.dropForeign(['category_id']);
    table.dropColumn('category_id');
  });

  await knex.schema.alterTable('apps', (table) => {
    table.integer('topic_id').unsigned();
    table.foreign('topic_id').references('id').inTable('topics');
  });
};
