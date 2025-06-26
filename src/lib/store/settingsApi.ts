/* eslint-disable import/no-cycle */
import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'

import { UpdatedSettingsType, SettingsType } from '../../types'



export const settingsApi = createApi({
  reducerPath: 'settingsApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:9000/settings' }),
  tagTypes: ['Settings'],
  endpoints: builder => ({
    getSettings: builder.query<SettingsType, void>({
      query: () => '',
      providesTags: ['Settings']
    }),
    updateSettings: builder.mutation<void, UpdatedSettingsType>({
      query: (updatedSettings: UpdatedSettingsType) => ({
        url: '',
        method: 'PUT',
        body: updatedSettings
      }),
      invalidatesTags: ['Settings']
    }),
  })
})

export const {
  useGetSettingsQuery,
  useLazyGetSettingsQuery,
  useUpdateSettingsMutation,
} = settingsApi
