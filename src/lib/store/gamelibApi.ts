import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'

import { CategoryEntry, GameEntry, StatusEntry, StringMap, TagEntry } from '../types/types-gamelibrary'

export const gamelibApi = createApi({
  reducerPath: 'gamelibApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:9000/api/' }),
  tagTypes: [
    'Games',
    'Categories',
    'Statuses',
    'Tags',
  ],
  endpoints: builder => ({
    getGames: builder.query<GameEntry[], void>({
      query: () => 'games',
      providesTags: ['Games'],
    }),
    getCategories: builder.query<CategoryEntry[], void>({
      query: () => 'categories',
      providesTags: ['Categories']
    }),
    getStatuses: builder.query<StatusEntry[], void>({
      query: () => 'statuses',
      providesTags: ['Statuses']
    }),
    getTags: builder.query<TagEntry[], void>({
      query: () => 'tags',
      providesTags: ['Tags']
    }),
    getStyleVars: builder.query<StringMap, void>({
      query: () => 'styles'
    }),
    editGame: builder.query<GameEntry, number>({
      query: (game_id: number) => `games/${game_id}`
    }),
    updateTimestamp: builder.mutation({
      query: ({game_id, type='played_at'}: {game_id: number, type?: 'played_at' | 'updated_at'}) => ({
        url: `timestamps/${type}/${game_id}`,
        method: 'PUT',
      }),
      invalidatesTags: ['Games']
    }),
    updateGame: builder.mutation({
      query: ({game_id, updatedGameData}: { game_id: number, updatedGameData: { [K in keyof GameEntry]?: GameEntry[K] } }) => ({
        url: `games/${game_id}`,
        method: 'PUT',
        body: updatedGameData,
      }),
      invalidatesTags: ['Games']
    }),
    newGame: builder.mutation({
      query: (game: Omit<GameEntry, 'game_id' | 'timestamps' | 'timestamps_sec'>) => ({
        url: 'games/new',
        method: 'POST',
        body: game,
      }),
      invalidatesTags: ['Games']
    })
  })
})

export const {
  useGetGamesQuery,
  useGetCategoriesQuery,
  useGetStatusesQuery,
  useGetTagsQuery,
  useGetStyleVarsQuery,
  useLazyEditGameQuery,
  useUpdateTimestampMutation,
  useUpdateGameMutation,
  useNewGameMutation,
} = gamelibApi
