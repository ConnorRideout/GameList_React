import {
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit"

import { GamelibState, GameEntry } from "../types/types-gamelibrary"
import { gamelibApi } from "./gamelibApi"
import { filesystemApi } from "./filesysteamApi"


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
  // TODO: state for game info for edit
  // gamelib states
  gamelib: [],
  editGame: null,
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
  config: {},
  // application status
  status: 'idle', // loading | succeeded | failed | idle | updating
  error: undefined,
}

const slice = createSlice({
  name: 'gamelib',
  initialState,
  reducers: {
    setStatus: (state, action) => {
      state.status = action.payload
    },
    setError: (state, action) => {
      state.status = 'failed'
      state.error = action.payload
    },
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload
    },
    setSearchRestraints: (state, action) => {
      state.searchRestraints = action.payload
    },
    clearSearchRestraints: (state) => {
      state.searchRestraints = defaultSearchRestraints
    },
    setEditGame: (state, action) => {
      state.editGame = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
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
      .addMatcher( // handle all errors
        (action): action is { payload: { data: { message: string } } } & PayloadAction => action.type.endsWith('/rejected'),
        (state, action) => {
          state.status = 'failed'
          state.error = action.payload.data.message
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
        filesystemApi.endpoints.getConfig.matchFulfilled,
        (state, action) => {
          state.config = action.payload
        }
      )
  }
})


export default slice.reducer

export const {
  setSortOrder,
  setStatus,
  setError,
  setSearchRestraints,
  clearSearchRestraints,
  setEditGame,
} = slice.actions
