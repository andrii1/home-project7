/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
// migrations/20250906120000_add_slug_to_tables.js
export async function up(knex) {
  const tables = [
    'categories',
    'features',
    'userTypes',
    'businessModels',
    'useCases',
    'industries',
    'apps',
  ];

  for (const table of tables) {
    await knex.schema.alterTable(table, (t) => {
      t.string('slug').notNullable().defaultTo('temp');
    });
  }
}

export async function down(knex) {
  const tables = [
    'categories',
    'features',
    'userTypes',
    'businessModels',
    'useCases',
    'industries',
    'apps',
  ];

  for (const table of tables) {
    await knex.schema.alterTable(table, (t) => {
      t.dropColumn('slug');
    });
  }
}
