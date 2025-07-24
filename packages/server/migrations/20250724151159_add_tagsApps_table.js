/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('tagsApps', (table) => {
    table.increments();
    table.integer('app_id').unsigned();
    table.foreign('app_id').references('id').inTable('apps');
    table.integer('tag_id').unsigned();
    table.foreign('tag_id').references('id').inTable('tags');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('tagsApps');
};
