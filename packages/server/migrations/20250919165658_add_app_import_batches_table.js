// migrations/20250919_create_app_import_batches.js
exports.up = function (knex) {
  return knex.schema.createTable('app_import_batches', (table) => {
    table.increments('id').primary();
    table.integer('last_offset').notNullable().defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('app_import_batches');
};
