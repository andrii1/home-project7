/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('topics', (table) => {
    table.increments();
    table.string('title').notNullable();
    table.integer('category_id').unsigned();
    table
      .foreign('category_id')
      .references('id')
      .inTable('categories')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('topics');
};
