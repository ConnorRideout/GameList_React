import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'
import { StringMap } from '../types/types-gamelibrary'

export const filesystemApi = createApi({
  reducerPath: 'filesystemApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:9000/filesystem/' }),
  tagTypes: ['Config'],
  endpoints: builder => ({
    getConfig: builder.query<any, void>({
      query: () => 'config',
      providesTags: ['Config'],
    }),
    updateConfig: builder.mutation({
      query: (newConfig: StringMap) => ({
        url: 'config',
        method: 'PUT',
        body: newConfig
      }),
      invalidatesTags: ['Config']
    }),
    playGame: builder.mutation({
      query: ({path, useLE=false}: {path: string, useLE: boolean}) => ({
        url: 'open/game',
        method: 'POST',
        body: {path, useLE}
      })
    }),
    openUrl: builder.mutation({
      query: (path: string) => ({
        url: 'open/webpage',
        method: 'POST',
        body: {path}
      })
    }),
    openFolder: builder.mutation({
      query: (path: string) => ({
        url: 'open/folder',
        method: 'POST',
        body: {path}
      })
    }),
    checkUpdatedUrl: builder.mutation({
      query: (checkUrl: string) => ({
        url: 'urlupdates',
        method: 'POST',
        body: {checkUrl}
      })
    })
  })
})

export const {
  useGetConfigQuery,
  useUpdateConfigMutation,
  usePlayGameMutation,
  useOpenUrlMutation,
  useOpenFolderMutation,
  useCheckUpdatedUrlMutation,
} = filesystemApi
