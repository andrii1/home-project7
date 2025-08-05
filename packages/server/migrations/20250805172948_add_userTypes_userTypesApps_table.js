/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable('userTypes', (table) => {
      table.increments();
      table.string('title').notNullable();
      table.text('meta_description').nullable();
    })
    .createTable('userTypesApps', (table) => {
      table.increments();
      table.integer('app_id').unsigned();
      table.foreign('app_id').references('id').inTable('apps');
      table.integer('userType_id').unsigned();
      table.foreign('userType_id').references('id').inTable('userTypes');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('userTypesApps').dropTable('userTypes');
};
