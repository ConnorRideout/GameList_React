import { configureStore } from "@reduxjs/toolkit"
import dataReducer from './gamelibrary'
import { gamelibApi } from "./gamelibApi"

const store = configureStore({
  reducer: {
    data: dataReducer,
    [gamelibApi.reducerPath]: gamelibApi.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(gamelibApi.middleware)
})

export type RootState = ReturnType<typeof store.getState>
export default store
