import {
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit"

import { GamelibState, GameEntry } from "../types/types-gamelibrary"
import { gamelibApi } from "./gamelibApi"
import { filesystemApi } from "./filesystemApi"
import { settingsApi } from "./settingsApi"


function sortGamelib(gamelib: GameEntry[], sortOrder: string): GameEntry[] {
  switch (sortOrder) {
    case 'recentlyPlayed':
      return gamelib
        .filter(g => g.timestamps.played_at)
        .sort((a, b) => b.timestamps_sec.played_at - a.timestamps_sec.played_at)
    case 'recentlyAdded':
      return [...gamelib]
        .sort((a, b) => b.timestamps_sec.created_at - a.timestamps_sec.created_at)
    case 'recentlyUpdated':
      return gamelib
        .filter(g => g.timestamps.updated_at)
        .sort((a, b) => b.timestamps_sec.updated_at - a.timestamps_sec.updated_at)
    case 'alphabetical':
      return [...gamelib]
    default:
      return gamelib
  }
}

const defaultSearchRestraints = {
  include: {
    tags: [],
    status: [],
    categories: {}
  },
  exclude: {
    tags: [],
    status: [],
    categories: {}
  }
}

const initialState: GamelibState = {
  // gamelib states
  gamelib: [],
  editGame: null,
  editGameType: 'edit',
  missingGames: [],
  newGames: [],
  // sorting states
  sortedGamelib: {
    recentlyPlayed: [],
    recentlyAdded: [],
    recentlyUpdated: [],
    alphabetical: [],
  },
  sortOrder: 'recentlyPlayed', // recentlyPlayed | recentlyAdded | recentlyUpdated | alphabetical
  searchRestraints: defaultSearchRestraints,
  // picker states
  categories: [],
  statuses: [],
  tags: [],
  // variable states
  styleVars: {},
  settings: {
    games_folder: '',
    locale_emulator: '',
    file_types: {
      Images: [],
      Executables: []
    },
    ignored_exes: [],
    site_scrapers: []
  },
  // application status
  status: 'idle', // loading | succeeded | failed | idle | updating
  error: undefined,
}

const slice = createSlice({
  name: 'gamelib',
  initialState,
  reducers: {
    setStatus: (state, action: { payload: GamelibState['status'] }) => {
      state.status = action.payload
    },
    setError: (state, action : { payload: GamelibState['error'] }) => {
      state.status = 'failed'
      state.error = action.payload
    },
    clearError: (state) => {
      state.status = 'succeeded'
      state.error = undefined
    },
    setSortOrder: (state, action: { payload: GamelibState['sortOrder'] }) => {
      state.sortOrder = action.payload
    },
    setSearchRestraints: (state, action: { payload: GamelibState['searchRestraints'] }) => {
      state.searchRestraints = action.payload
    },
    clearSearchRestraints: (state) => {
      state.searchRestraints = defaultSearchRestraints
    },
    setEditType: (state, action: { payload: GamelibState['editGameType'] }) => {
      state.editGameType = action.payload
    },
    clearEditGame: (state) => {
      state.editGame = null
    },
    setMissingGames: (state, action: {payload: GamelibState['missingGames']}) => {
      state.missingGames = action.payload
    },
    enqueueMissingGame: (state, action: { payload: GamelibState['missingGames'][0] }) => {
      state.missingGames.push(action.payload)
    },
    dequeueMissingGame: (state) => {
      state.missingGames.shift()
    },
    clearMissingGames: (state) => {
      state.missingGames = []
    }
  },
  extraReducers: (builder) => {
    builder
      .addMatcher( // handle all errors
        (action): action is { payload: { data: { message: string } } } & PayloadAction => action.type.endsWith('/rejected'),
        (state, action) => {
          state.status = 'failed'
          state.error = action.payload.data.message
        }
      )
      // GET DATA
      .addMatcher(
        gamelibApi.endpoints.getGames.matchPending,
        (state) => {
          state.status = 'loading'
        }
      )
      .addMatcher(
        gamelibApi.endpoints.getGames.matchFulfilled,
        (state, action) => {
          state.status = 'succeeded'
          state.gamelib = action.payload
          state.sortedGamelib.recentlyPlayed = sortGamelib(action.payload, 'recentlyPlayed')
          state.sortedGamelib.recentlyAdded = sortGamelib(action.payload, 'recentlyAdded')
          state.sortedGamelib.recentlyUpdated = sortGamelib(action.payload, 'recentlyUpdated')
          state.sortedGamelib.alphabetical = sortGamelib(action.payload, 'alphabetical')
        }
      )
      .addMatcher(
        gamelibApi.endpoints.getCategories.matchFulfilled,
        (state, action) => {
          state.categories = action.payload
        }
      )
      .addMatcher(
        gamelibApi.endpoints.getStatuses.matchFulfilled,
        (state, action) => {
          state.statuses = action.payload
        }
      )
      .addMatcher(
        gamelibApi.endpoints.getTags.matchFulfilled,
        (state, action) => {
          state.tags = action.payload
        }
      )
      // VARIABLES
      .addMatcher(
        gamelibApi.endpoints.getStyleVars.matchFulfilled,
        (state, action) => {
          state.styleVars = action.payload
        }
      )
      .addMatcher(
        settingsApi.endpoints.getSettings.matchFulfilled,
        (state, action) => {
          state.settings = action.payload
        }
      )
      // GET GAME FOR EDIT
      .addMatcher(
        gamelibApi.endpoints.editGame.matchFulfilled,
        (state, action) => {
          state.editGame = action.payload
        }
      )
      // FIND MISSING GAMES
      .addMatcher(
        filesystemApi.endpoints.checkMissingGames.matchFulfilled,
        (state, action) => {
          state.missingGames = action.payload
        }
      )
      // FIND NEW GAMES
      .addMatcher(
        filesystemApi.endpoints.checkNewGames.matchFulfilled,
        (state, action) => {
          state.newGames = action.payload
        }
      )
  }
})


export default slice.reducer

export const {
  setSortOrder,
  setStatus,
  setError,
  clearError,
  setSearchRestraints,
  clearSearchRestraints,
  setEditType,
  clearEditGame,
  setMissingGames,
  enqueueMissingGame,
  dequeueMissingGame,
  clearMissingGames,
} = slice.actions
