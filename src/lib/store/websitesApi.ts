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
    autofillFromWebsite: builder.mutation<{type: string, parsed: string | string[]}[], {website_id: number, url: string}>({
      query: ({website_id, url}) => ({
        url: 'scrape',
        method: 'POST',
        body: {website_id, url}
      })
    }),
    // test: builder.mutation<void, void>({
    //   query: () => ({
    //     url: 'test',
    //     method: 'POST'
    //   })
    // })
  }),
})

export const {
  useCheckUpdatedUrlMutation,
  useAutofillFromWebsiteMutation,
  // useTestMutation,
} = websitesApi
