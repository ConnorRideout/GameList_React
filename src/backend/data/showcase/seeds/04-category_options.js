/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = (knex) => {
  return knex('category_options').insert([
    {category_id: 1, option_name: "Text"},
    {category_id: 1, option_name: "Pixel"},
    {category_id: 1, option_name: "3D"},
    {category_id: 1, option_name: "Drawn"},

    {category_id: 2, option_name: "Flash"},
    {category_id: 2, option_name: "HTML"},
    {category_id: 2, option_name: "Java"},
    {category_id: 2, option_name: "Others"},
    {category_id: 2, option_name: "Ren'Py"},
    {category_id: 2, option_name: "RPGM"},
    {category_id: 2, option_name: "Unity"},
    {category_id: 2, option_name: "Unreal"},
    {category_id: 2, option_name: "Wolf RPG"},

    {category_id: 3, option_name: "Action"},
    {category_id: 3, option_name: "Adventure"},
    {category_id: 3, option_name: "Fighter"},
    {category_id: 3, option_name: "Platformer"},
    {category_id: 3, option_name: "Puzzler"},
    {category_id: 3, option_name: "Sandbox"},
    {category_id: 3, option_name: "Visual Novel"},
    {category_id: 3, option_name: "Others"},
    {category_id: 3, option_name: "Unknown"},

    {category_id: 4, option_name: "New", option_is_default: true},
    {category_id: 4, option_name: "Updated"},
    {category_id: 4, option_name: "Playing"},
    {category_id: 4, option_name: "Beaten"},
    {category_id: 4, option_name: "Watching"},

    {category_id: 5, option_name: "Male"},
    {category_id: 5, option_name: "Female"},
    {category_id: 5, option_name: "Other"},
    {category_id: 5, option_name: "Multiple"},
    {category_id: 5, option_name: "Created"},
    {category_id: 5, option_name: "Unknown", option_id_default: true},
  ]);
};
