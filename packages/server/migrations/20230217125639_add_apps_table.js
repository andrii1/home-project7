/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('apps', (table) => {
    table.increments();
    table.text('title').notNullable();
    table.text('description').nullable();
    table.integer('topic_id').unsigned();
    table.foreign('topic_id').references('id').inTable('topics');
    table.string('apple_id').nullable();
    table.text('url').nullable();
    table.text('url_x').nullable();
    table.text('url_discord').nullable();
    table.text('url_app_store').nullable();
    table.text('url_google_play_store').nullable();
    table.text('url_chrome_extension').nullable();
    table.text('url_image').nullable();
    table.string('meta_description').nullable();
    table.datetime('created_at', { precision: 6 }).defaultTo(knex.fn.now(6));
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('apps');
};
