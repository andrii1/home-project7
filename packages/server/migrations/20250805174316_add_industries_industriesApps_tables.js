/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable('industries', (table) => {
      table.increments();
      table.string('title').notNullable();
      table.text('meta_description').nullable();
    })
    .createTable('industriesApps', (table) => {
      table.increments();
      table.integer('app_id').unsigned();
      table.foreign('app_id').references('id').inTable('apps');
      table.integer('industry_id').unsigned();
      table.foreign('industry_id').references('id').inTable('industries');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('industriesApps').dropTable('industries');
};
