import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'

export const websitesApi = createApi({
  reducerPath: 'websitesApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:9000/websites' }),
  endpoints: builder => ({
    checkUpdatedUrl: builder.mutation<{message: string, redirectedUrl: string}, string>({
      query: (checkUrl: string) => ({
        url: 'urlupdates',
        method: 'POST',
        body: {checkUrl}
      })
    }),
    autofillFromWebsite: builder.mutation<{type: string, parsed: string | string[]}[], {base_url: string, url: string}>({
      query: ({base_url, url}) => ({
        url: 'scrape',
        method: 'POST',
        body: {base_url, url}
      })
    })
  }),
})

export const {
  useCheckUpdatedUrlMutation,
  useAutofillFromWebsiteMutation,
} = websitesApi
