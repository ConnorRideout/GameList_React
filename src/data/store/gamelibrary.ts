// TODO: update to use RTK query
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"

import { GamelibState, GameEntry } from "../types/types-gamelibrary"

function url(append = '') {
  const path = append.slice(0,1) === '/' ? append.slice(1) : append
  return `http://localhost:9000/${path}`
}

export const getData = createAsyncThunk(
  'data/getData',
  async () => {
    const {data: gamelib} = await axios.get(url())
    const {data: categories} = await axios.get(url('categories'))
    const {data: statuses} = await axios.get(url('status'))
    const {data: tags} = await axios.get(url('tags'))
    const {data: styleVars} = await axios.get(url('styles'))
    return {gamelib, categories, statuses, tags, styleVars}
  }
)

function sortGamelib(gamelib: GameEntry[], sortOrder: string) {
  switch (sortOrder) {
    case 'recentlyPlayed':

      return gamelib
        .filter(g => g.timestamps.played_at)
        .sort((a, b) => {
          const dateA = new Date(a.timestamps.played_at.replace(' ', 'T')).getTime()
          const dateB = new Date(b.timestamps.played_at.replace(' ', 'T')).getTime()
          return dateB - dateA
        })
    case 'recentlyAdded':
      return [...gamelib]
        .sort((a, b) => {
          const dateA = new Date(a.timestamps.created_at.replace(' ', 'T')).getTime()
          const dateB = new Date(b.timestamps.created_at.replace(' ', 'T')).getTime()
          return dateB - dateA
        })
    case 'recentlyUpdated':
      return gamelib
        .filter(g => g.timestamps.updated_at)
        .sort((a, b) => {
          const dateA = new Date(a.timestamps.updated_at.replace(' ', 'T')).getTime()
          const dateB = new Date(b.timestamps.updated_at.replace(' ', 'T')).getTime()
          return dateB - dateA
        })
    case 'alphabetical':
      return gamelib
    default:
      return gamelib
  }
}

const initialState: GamelibState = {
  gamelib: [],
  sortedGamelib: [],
  sortOrder: 'recentlyPlayed',
  categories: [],
  statuses: [],
  tags: [],
  styleVars: {},
  // application status
  status: 'idle', // loading succeeded failed idle updating
  error: undefined,
}

const slice = createSlice({
  name: 'gamelib',
  initialState,
  reducers: {
    setStatus: (state, action) => {
      state.status = action.payload
    },
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload
      state.sortedGamelib = sortGamelib(state.gamelib, action.payload)
    }
  },
  extraReducers: (builder) => {
    builder
      // GET DATA
      .addCase(getData.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(getData.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const keys = ['gamelib', 'categories', 'statuses', 'tags', 'styleVars']
        keys.forEach(k => {
          state[k] = action.payload[k]
        })
        state.sortedGamelib = sortGamelib(state.gamelib, state.sortOrder)
      })
      .addCase(getData.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
  }
})


export default slice.reducer

export const { setSortOrder, setStatus } = slice.actions
