import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'

// eslint-disable-next-line import/no-cycle
import {
  CategoryEntry,
  GameEntry,
  StatusEntry,
  StringMap,
  TagEntry,
  DislikedGamesType
} from '../../types'


export const GAMELIB_TAG = {
  SearchParams: 'SearchParams'
}

export const gamelibApi = createApi({
  reducerPath: 'gamelibApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:9000/api/' }),
  tagTypes: [
    'Games',
    'Dislikes',
    GAMELIB_TAG.SearchParams
  ],
  endpoints: builder => ({
    getGames: builder.query<GameEntry[], void>({
      query: () => 'games',
      providesTags: ['Games'],
    }),
    getCategories: builder.query<CategoryEntry[], void>({
      query: () => 'categories',
      providesTags: [GAMELIB_TAG.SearchParams]
    }),
    getStatuses: builder.query<StatusEntry[], void>({
      query: () => 'statuses',
      providesTags: [GAMELIB_TAG.SearchParams]
    }),
    getTags: builder.query<TagEntry[], void>({
      query: () => 'tags',
      providesTags: [GAMELIB_TAG.SearchParams]
    }),
    getStyleVars: builder.query<StringMap, void>({
      query: () => 'styles'
    }),
    getDislikedGames: builder.query<DislikedGamesType[], void>({
      query: () => 'dislikes',
      providesTags: ['Dislikes']
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
      query: ({game_id, updatedGameData}: { game_id: number, updatedGameData: { [K in keyof Omit<GameEntry, 'image'>]?: GameEntry[K] } & {image: string} }) => ({
        url: `games/${game_id}`,
        method: 'PUT',
        body: updatedGameData,
      }),
      invalidatesTags: ['Games']
    }),
    newGame: builder.mutation({
      query: (game: Omit<GameEntry, 'game_id' | 'timestamps' | 'timestamps_sec' | 'image'> & {image: string}) => ({
        url: 'games/new',
        method: 'POST',
        body: game,
      }),
      invalidatesTags: ['Games']
    }),
    deleteGame: builder.mutation({
      query: (game_id: number) => ({
        url: `games/${game_id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Games']
    }),
    newDislike: builder.mutation({
      query: ({game_title, dislike_reason}: {game_title: string, dislike_reason: string}) => ({
        url: 'dislikes',
        method: 'POST',
        body: {game_title, dislike_reason}
      }),
      invalidatesTags: ['Dislikes']
    }),
    updateDislike: builder.mutation({
      query: ({dislike_id, game_title, dislike_reason}: {dislike_id: number, game_title: string, dislike_reason: string}) => ({
        url: `dislikes/${dislike_id}`,
        method: 'PUT',
        body: {game_title, dislike_reason}
      }),
      invalidatesTags: ['Dislikes']
    }),
    deleteDislike: builder.mutation({
      query: (dislike_id: number) => ({
        url: `dislikes/${dislike_id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Dislikes']
    })
  })
})

export const {
  useGetGamesQuery,
  useGetCategoriesQuery,
  useGetStatusesQuery,
  useGetTagsQuery,
  useGetStyleVarsQuery,
  useGetDislikedGamesQuery,
  useLazyEditGameQuery,
  useUpdateTimestampMutation,
  useUpdateGameMutation,
  useNewGameMutation,
  useDeleteGameMutation,
  useNewDislikeMutation,
  useUpdateDislikeMutation,
  useDeleteDislikeMutation,
} = gamelibApi
