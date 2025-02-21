import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'
import { GameEntry } from '../types/types-gamelibrary'

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
    getGames: builder.query<any, void>({
      query: () => 'games',
      providesTags: ['Games'],
    }),
    getCategories: builder.query<any, void>({
      query: () => 'categories',
      providesTags: ['Categories']
    }),
    getStatuses: builder.query<any, void>({
      query: () => 'statuses',
      providesTags: ['Statuses']
    }),
    getTags: builder.query<any, void>({
      query: () => 'tags',
      providesTags: ['Tags']
    }),
    getStyleVars: builder.query<any, void>({
      query: () => 'styles'
    }),
    editGame: builder.query<any, number>({
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
      query: ({game_id, game}: {game_id: number, game: GameEntry}) => ({
        url: `games/${game_id}`,
        method: 'PUT',
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
} = gamelibApi
