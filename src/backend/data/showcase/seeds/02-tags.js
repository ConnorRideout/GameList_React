/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = (knex) => {
  return knex('tags').insert([
    {tag_name: "Animated"},
    {tag_name: "Indie"},
    {tag_name: "Singleplayer"},
    {tag_name: "Multiplayer"},
    {tag_name: "Fantasy"},
    {tag_name: "Cute"},
    {tag_name: "Simulation"},
    {tag_name: "Retro"},
    {tag_name: "PvP"},
    {tag_name: "LGBTQ+"},
    {tag_name: "Racing"},
    {tag_name: "Survival"},
    {tag_name: "Mystery"},
    {tag_name: "Horror"},
    {tag_name: "Magic"},
    {tag_name: "Roguelike"},
    {tag_name: "Building"},
    {tag_name: "Management"},
    {tag_name: "Atmospheric"},
    {tag_name: "VR"},
    {tag_name: "Turn-based"},
    {tag_name: "Dating Sim"},
    {tag_name: "First-Person"},
    {tag_name: "Third-Person"},
  ])
};
