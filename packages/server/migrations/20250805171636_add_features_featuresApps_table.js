/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable('features', (table) => {
      table.increments();
      table.string('title').notNullable();
      table.text('meta_description').nullable();
    })
    .createTable('featuresApps', (table) => {
      table.increments();
      table.integer('app_id').unsigned();
      table.foreign('app_id').references('id').inTable('apps');
      table.integer('feature_id').unsigned();
      table.foreign('feature_id').references('id').inTable('features');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('featuresApps').dropTable('features');
};
