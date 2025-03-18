import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'
import { SettingsType } from '../types/types-gamelibrary'


export const settingsApi = createApi({
  reducerPath: 'settingsApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:9000/settings' }),
  tagTypes: ['Settings'],
  endpoints: builder => ({
    getSettings: builder.query<SettingsType, void>({
      query: () => '',
      providesTags: ['Settings']
    }),
    updateSettings: builder.mutation<void, SettingsType>({
      query: (updatedSettings: SettingsType) => ({
        url: '',
        method: 'PUT',
        body: {updatedSettings}
      }),
      invalidatesTags: ['Settings']
    })
  })
})

export const {
  useGetSettingsQuery,
  useLazyGetSettingsQuery,
  useUpdateSettingsMutation,
} = settingsApi
