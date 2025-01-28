import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"

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

const slice = createSlice({
  name: 'gamelib',
  initialState: {
    gamelib: [],
    categories: [],
    statuses: [],
    tags: [],
    styleVars: {},
    // application status
    status: 'idle',
    error: null,
  },
  reducers: {},
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
      })
      .addCase(getData.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
  }
})

export default slice.reducer

export const { setStyleVars } = slice.actions
