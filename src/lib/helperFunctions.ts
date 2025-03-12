// eslint-disable-next-line import/prefer-default-export
export function toTitleCase(str: string) {
  return str.replaceAll(/(?:^|\s|\d|-|_|'|"|`)([a-z])/g, (match) => match.toUpperCase())
}