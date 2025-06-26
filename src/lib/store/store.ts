/* eslint-disable import/no-cycle */
import { configureStore } from "@reduxjs/toolkit"

import dataReducer from './gamelibrary'
import { gamelibApi } from "./gamelibApi"
import { filesystemApi } from "./filesystemApi"
import { websitesApi } from "./websitesApi"
import { settingsApi } from "./settingsApi"

const store = configureStore({
  reducer: {
    data: dataReducer,
    [gamelibApi.reducerPath]: gamelibApi.reducer,
    [filesystemApi.reducerPath]: filesystemApi.reducer,
    [settingsApi.reducerPath]: settingsApi.reducer,
    [websitesApi.reducerPath]: websitesApi.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware()
      .concat(gamelibApi.middleware)
      .concat(filesystemApi.middleware)
      .concat(websitesApi.middleware)
      .concat(settingsApi.middleware)
})

export type RootState = ReturnType<typeof store.getState>
export default store
