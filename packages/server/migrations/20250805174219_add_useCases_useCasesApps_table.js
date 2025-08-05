/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable('useCases', (table) => {
      table.increments();
      table.string('title').notNullable();
      table.text('meta_description').nullable();
    })
    .createTable('useCasesApps', (table) => {
      table.increments();
      table.integer('app_id').unsigned();
      table.foreign('app_id').references('id').inTable('apps');
      table.integer('useCase_id').unsigned();
      table.foreign('useCase_id').references('id').inTable('useCases');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('useCasesApps').dropTable('useCases');
};
