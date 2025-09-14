exports.up = function (knex) {
  return knex.schema.table('apps', (table) => {
    table.text('faq_create_account').nullable();
    table.text('faq_delete_account').nullable();
    table.text('faq_contact_support').nullable();
    table.text('faq_cancel_subscription').nullable();
    table.text('faq_change_profile_picture').nullable();
    table.text('faq_log_in').nullable();
    table.text('faq_log_out').nullable();
    table.text('faq_is_app_on_android').nullable();
    table.text('faq_app_doesnt_work_bugs').nullable();
    table.text('faq_is_safe_to_use').nullable();
    table.text('faq_how_to_make_money').nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.table('apps', (table) => {
    table.dropColumn('faq_create_account');
    table.dropColumn('faq_delete_account');
    table.dropColumn('faq_contact_support');
    table.dropColumn('faq_cancel_subscription');
    table.dropColumn('faq_change_profile_picture');
    table.dropColumn('faq_log_in');
    table.dropColumn('faq_log_out');
    table.dropColumn('faq_is_app_on_android');
    table.dropColumn('faq_app_doesnt_work_bugs');
    table.dropColumn('faq_is_safe_to_use');
    table.dropColumn('faq_how_to_make_money');
  });
};
