/* eslint-disable import/no-cycle */
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
  LoginType,
  SettingsType,
  MissingGamesType,
  DislikedGamesType,
} from "./lib/types/types-gamelibrary"

export type MenuAction = {
  type: 'OPEN_GAMES_FOLDER' | 'OPEN_SETTINGS' | 'CHECK_MISSING' | 'CHECK_NEW' | 'CHECK_UPDATED' | 'OPEN_DISLIKE_NOTES',
}
export interface ContextMenuTemplate {
  label: string,
  trigger: string,
  target: string | number,
}
export { DefaultGamesFormType, UpdatedSettingsType } from './renderer/settings/settings'
