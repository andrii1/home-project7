/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('apps', (table) => {
    table.string('price').nullable();
    table.string('currency').nullable();
    table.string('developer').nullable();
    table.string('developerUrl').nullable();
    table.string('developerId').nullable();
    table.timestamp('released').nullable();
    table.text('languages').nullable();
    table.string('url_windows').nullable();
    table.string('url_mac').nullable();
    table.boolean('pricing_free').defaultTo(false);
    table.boolean('pricing_freemium').defaultTo(false);
    table.boolean('pricing_paid').defaultTo(false);
    table.boolean('pricing_subscription').defaultTo(false);
    table.boolean('pricing_one_time').defaultTo(false);
    table.boolean('pricing_trial_available').defaultTo(false);
    table.text('pricing_details').nullable(); // e.g. "$9/mo or $89/year"
    table.string('pricing_url').nullable();
    table.boolean('is_ai_powered').defaultTo(false);
    table.boolean('is_open_source').defaultTo(false);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('apps', (table) => {
    table.dropColumn('price');
    table.dropColumn('currency');
    table.dropColumn('developer');
    table.dropColumn('developerUrl');
    table.dropColumn('developerId');
    table.dropColumn('released');
    table.dropColumn('languages');
    table.dropColumn('url_windows');
    table.dropColumn('url_mac');
    table.dropColumn('pricing_free');
    table.dropColumn('pricing_free');
    table.dropColumn('pricing_freemium');
    table.dropColumn('pricing_paid');
    table.dropColumn('pricing_subscription');
    table.dropColumn('pricing_one_time');
    table.dropColumn('pricing_trial_available');
    table.dropColumn('pricing_details');
    table.dropColumn('pricing_url');
    table.dropColumn('is_ai_powered');
    table.dropColumn('is_open_source');
  });
};
