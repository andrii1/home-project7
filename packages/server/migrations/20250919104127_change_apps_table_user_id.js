exports.up = function (knex) {
  return knex.schema.table('apps', (table) => {
    table.integer('user_id').unsigned();
    table.foreign('user_id').references('id').inTable('users');
    table.string('url_fb').nullable();
    table.text('url_linkedin').nullable();
    table.text('e-mail').nullable();
    table
      .enum('status', ['published', 'draft'])
      .notNullable()
      .defaultTo('published'); // Add enum column with default
  });
};

exports.down = function (knex) {
  return knex.schema.table('apps', (table) => {
    table.dropForeign('user_id');
    table.dropColumn('user_id');
    table.dropColumn('url_fb');
    table.dropColumn('url_linkedin');
    table.dropColumn('e-mail');
    table.dropColumn('status');
  });
};
