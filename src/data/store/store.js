import { configureStore } from "@reduxjs/toolkit"
import dataReducer from './gamelibrary'

const store = configureStore({
  reducer: {
    data: dataReducer,
  }
})

export default store
