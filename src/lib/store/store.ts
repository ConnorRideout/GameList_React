import { configureStore } from "@reduxjs/toolkit"

import dataReducer from './gamelibrary'
import { gamelibApi } from "./gamelibApi"
import { filesystemApi } from "./filesystemApi"

const store = configureStore({
  reducer: {
    data: dataReducer,
    [gamelibApi.reducerPath]: gamelibApi.reducer,
    [filesystemApi.reducerPath]: filesystemApi.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware()
      .concat(gamelibApi.middleware)
      .concat(filesystemApi.middleware)
})

export type RootState = ReturnType<typeof store.getState>
export default store
