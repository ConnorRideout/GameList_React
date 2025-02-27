/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = (knex) => {
  return knex('ignored_exes').insert([
    {exe: 'UnityCrashHandler.+'},
    {exe: '.*-32.exe'},
    {exe: 'credits.html'},
    {exe: '.*readme.+'},
    {exe: '.*Config.+'},
    {exe: '.*setup.+'},
    {exe: 'notification_helper.exe'},
  ])
};
