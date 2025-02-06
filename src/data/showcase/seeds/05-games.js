const {LoremIpsum} = require('lorem-ipsum')

const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 12,
    min: 1,
  },
  wordsPerSentence: {
    max: 15,
    min: 3
  }
})
const randInt = (...args) => {
  const [start, end] = args.length === 2 ? args : [0, args[0]]
  return Math.floor(Math.random() * (end + 1 - start)) + start
}
function generateVersion() {
  const version = []
  const count = randInt(1, 3)
  for (let i = 0; i < count; i++) {
    version.push(randInt(99))
  }
  return version.join('.')
}
function generateProtag() {
  const protags = ['Male', 'Female', 'Other']
  return protags[randInt(2)]
}

function generateGame(idx, titleStartswith) {
  return {
    path: `GamePath${idx}`,
    title: `${titleStartswith}${lorem.generateWords(2)} ${idx}`,
    url: 'https://itch.io',
    image: `game${randInt(9)}.jpg`,
    version: generateVersion(),
    description: lorem.generateParagraphs(1),
    program_path: '{"":"game.exe"}',
    protagonist: generateProtag(),
  }
}

const alpha = '[1ABCDEFGHIJKLMPQRSTUVWXYZ'.split('')
const letters = [...alpha]
for (let i = 0; i < 102; i++) {
  const randomIdx = Math.floor(Math.random() * alpha.length)
  letters.push(alpha[randomIdx])
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = (knex) => {
  return knex('games').insert(
    letters.map((l, idx) => generateGame(idx, l))
  )
}
