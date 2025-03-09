export { RootState } from "./lib/store/store"
export {
  StringMap,
  GamelibState,
  GameEntry,
  Timestamps,
  CategoryEntry,
  StatusEntry,
  TagEntry,
  SearchRestraints,
  SettingsType,
  MissingGamesType,
} from "./lib/types/types-gamelibrary"

export type MenuAction = {
  type: 'OPEN_GAMES_FOLDER' | 'OPEN_SETTINGS' | 'CHECK_MISSING' | 'CHECK_NEW' | 'CHECK_UPDATED',
}
export type ContextMenuTemplate = {
  label: string,
  trigger: string,
  target: string | number,
}
