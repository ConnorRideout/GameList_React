import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'
import { GamelibState, StringMap } from '../types/types-gamelibrary'

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
    openFolder: builder.mutation<void, string>({
      query: (path: string) => ({
        url: 'open/folder',
        method: 'POST',
        body: {path}
      })
    }),
    checkUpdatedUrl: builder.mutation<{message: string, redirectedUrl: string}, string>({
      query: (checkUrl: string) => ({
        url: 'urlupdates',
        method: 'POST',
        body: {checkUrl}
      })
    }),
    checkMissingGames: builder.mutation<GamelibState['missingGames'], {game_id: number, path: string}[]>({
      query: (games: {game_id: number, path: string}[]) => ({
        url: 'missinggames',
        method: 'POST',
        body: {games}
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
  useCheckMissingGamesMutation,
} = filesystemApi
