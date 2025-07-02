/* eslint-disable func-names */
// TODO: add validation for logins
import * as yup from 'yup'


function createAliasTest(type: string) {
  return yup.array()
    .of(
      yup.array()
        .length(2)
        .test('site-text-check', `Scrapers > Scraper Aliases Warning: ${type} aliases need text from the website`,
          (site_text) => !!(site_text && site_text[0])
        )
        .test('native-name-check', `Scrapers > Scraper Aliases Warning: ${type} aliases need a native name`,
          (nat_name) => !!(nat_name && nat_name[1])
        )
    )
}
/*
{
  website_id: number,
  base_url: string,
  selectors: {
      type: string,
      selector: string,
      queryAll: boolean,
      regex: string,
      limit_text: boolean,
      remove_regex: string,
  }[],
  aliases: {
    [k in 'tags' | 'categories' | 'statuses']: {
      [base_url: string]: [string, string][];
    };
  }
}[]
*/
export default function CreateScrapersFormSchema() {
  return yup.array()
      .of(
        yup.object().shape({
          website_id: yup.number()
            .required(),
          base_url: yup.string()
            .required('Scrapers > Site Scrapers Warning: a base url is required'),
          selectors: yup.array()
            .of(
              yup.object().shape({
                type: yup.string()
                  .required('Scrapers > Site Scrapers Warning: all Reference Types must be defined'),
                selector: yup.string()
                  .required('Scrapers > Site Scrapers Warning: all JS Selectors must be defined'),
                queryAll: yup.boolean(),
                regex: yup.string()
                  .test('has-group', 'Scrapers > Site Scrapers Warning: matchers, if defined, must have a regex matcher group', (regex) => {
                    if (!regex) return true
                    try {
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      const re = new RegExp(regex)
                      return /\([^?]/.test(regex)
                    } catch (e) {
                      return false
                    }
                  }),
                limit_text: yup.boolean(),
                remove_regex: yup.string(),
              })
            )
            .min(1, 'Scrapers > Site Scrapers Warning: all base urls need at least 1 JS Selector'),
          aliases: yup.object().shape({
            tags: createAliasTest('tag'),
            categories: createAliasTest('category'),
            statuses: createAliasTest('status'),
          }),
        })
      )
}
