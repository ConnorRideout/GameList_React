import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'

export const filesystemApi = createApi({
  reducerPath: 'filesystemApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:9000/filesystem/' }),
  endpoints: builder => ({
    playGame: builder.mutation({
      query: (filepath: string) => ({
        url: 'play',
        method: 'POST',
        body: {filepath}
      })
    })
  })
})

export const {
  usePlayGameMutation,
} = filesystemApi
