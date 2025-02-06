import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'

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
  })
})

export const {
  useGetGamesQuery,
  useGetCategoriesQuery,
  useGetStatusesQuery,
  useGetTagsQuery,
  useGetStyleVarsQuery,
} = gamelibApi
