/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable('businessModels', (table) => {
      table.increments();
      table.string('title').notNullable();
      table.text('meta_description').nullable();
    })
    .createTable('businessModelsApps', (table) => {
      table.increments();
      table.integer('app_id').unsigned();
      table.foreign('app_id').references('id').inTable('apps');
      table.integer('businessModel_id').unsigned();
      table
        .foreign('businessModel_id')
        .references('id')
        .inTable('businessModels');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTable('businessModelsApps')
    .dropTable('businessModels');
};
