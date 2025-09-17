exports.up = function (knex) {
  return knex.schema.table('apps', (table) => {
    table.text('description_how_to_use').nullable();
    table.text('faq_should_you_upgrade').nullable();
    table.text('faq_can_use_for_free').nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.table('apps', (table) => {
    table.dropColumn('description_how_to_use');
    table.dropColumn('faq_should_you_upgrade');
    table.dropColumn('faq_can_use_for_free');
  });
};
