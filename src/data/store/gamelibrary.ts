import {
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit"

import { GamelibState, GameEntry } from "../types/types-gamelibrary"
import { gamelibApi } from "./gamelibApi"


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
  // TODO: state for user-editable settings (like location of games)
  gamelib: [],
  sortedGamelib: {
    recentlyPlayed: [],
    recentlyAdded: [],
    recentlyUpdated: [],
    alphabetical: [],
  },
  sortOrder: 'recentlyPlayed', // recentlyPlayed | recentlyAdded | recentlyUpdated | alphabetical
  searchRestraints: defaultSearchRestraints,
  // sorting states
  categories: [],
  statuses: [],
  tags: [],
  styleVars: {},
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
    }
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
        (action): action is { error: { message: string } } & PayloadAction => action.type.endsWith('/rejected'),
        (state, action) => {
          state.status = 'failed'
          state.error = action.error.message
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
      .addMatcher(
        gamelibApi.endpoints.getStyleVars.matchFulfilled,
        (state, action) => {
          state.styleVars = action.payload
        }
      )
  }
})


export default slice.reducer

export const { setSortOrder, setStatus, setError, setSearchRestraints, clearSearchRestraints } = slice.actions
