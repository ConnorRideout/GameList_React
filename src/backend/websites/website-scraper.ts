// TODO: login to sites

/* eslint-disable import/no-relative-packages */
/* eslint-disable func-names */
/* eslint-disable no-restricted-syntax */
import axios from "axios"
import * as cheerio from "cheerio"

import { CategoryEntry, SettingsType, StatusEntry, TagEntry } from "../../types"

// const includedElementTags = ['b', 'i', 'strong', 'em', 'u', 's', 'del', 'sub', 'sup', 'small', 'big', 'mark', 'code', 'pre', 'blockquote', 'span']

export default class SiteScraper {
  categories

  statuses

  statusesLower

  tags

  tagsLower

  aliases

  url=''

  constructor(
    categories: CategoryEntry[],
    statuses: StatusEntry[],
    tags: TagEntry[],
    aliases: SettingsType['site_scraper_aliases']
  ) {
    this.categories = categories.map(({category_name, options}) => ({category_name, options}))
    this.statuses = statuses.map(({status_name}) => status_name)
    this.statusesLower = statuses.map(({status_name}) => status_name.toLowerCase())
    this.tags = tags.map(({tag_name}) => tag_name)
    this.tagsLower = tags.map(({tag_name}) => tag_name.toLowerCase())
    this.aliases = aliases
  }

  filterCustomSelectors(parsedSelectors: {type: string, parsed: string | string[]}[]) {
    const result = parsedSelectors.map(pSel => {
      const { type, parsed } = pSel
      if (['title', 'version', 'description'].includes(type))
        return pSel
      const selectorValues = (parsed as string[])
      const parseValues = (
        ref: this['statuses'] | this['tags'] | this['categories'][0]['options'],
        refLower: this['statusesLower'] | this['tagsLower'] | this['categories'][0]['options'],
        aliasesType: SettingsType['site_scraper_aliases'][keyof SettingsType['site_scraper_aliases']]
      ) => {
        const [,aliases] = Object.entries(aliasesType).find(([base_url]) => this.url.includes(base_url)) || []
        const filteredParsed = selectorValues
          .reduce((acc: string[], cur) => {
            // // apply aliases
            if (aliases) {
              const alias = aliases.find(([website_val]) => cur.toLowerCase() === website_val)
              // console.log(cur, alias)
              if (alias) {
                if (!acc.includes(alias[1]))
                  acc.push(alias[1])
                return acc
              }
            }
            // filter the values so only defined values remain (with correct capitalization)
            if (refLower.includes(cur.toLowerCase())) {
              const idx = refLower.indexOf(cur.toLowerCase())
              acc.push(ref[idx])
            }
            // value wasn't found
            return acc
          }, [])
        return filteredParsed
      }
      if (type === 'status') {
        return {type, parsed: parseValues(this.statuses, this.statusesLower, this.aliases.statuses)}
      } else if (type === 'tags' || type === 'tag') {
        return  {type, parsed: parseValues(this.tags, this.tagsLower, this.aliases.tags)}
      } else if (type.startsWith('category')) {
        const catName = type.replace(/^category_/, '')
        const {options} = (this.categories.find(c => c.category_name === catName)!)
        const lowerOptions = options?.map(opt => opt.toLowerCase())
        return {type, parsed: parseValues(options, lowerOptions, this.aliases.categories)}
      }
      // fallback
      return pSel
    })
    return result
  }

  scrape(url: string, selectors: SettingsType['site_scrapers'][0]['selectors']) {
    this.url = url
    const parsedSelectors: {type: string, parsed: string | string[]}[] = []
    return axios.get(url)
      .then(response => {
        const html = response.data
        const $ = cheerio.load(html)

        // const {type, selector, queryAll, regex, limit_text, remove_regex} = selectors[2]
        selectors.forEach(({type, selector, queryAll, regex, limit_text, remove_regex}) => {
          const $selected = $(selector)
          // get the text content, which is either an array of strings (if queryAll=true) else a string
          let textContent: string | string[]
          if (queryAll) {
            // get an array of text contents
            textContent = []
            $selected.each((i, el) => {
              let text
              if (limit_text) {
                // only get the text within the parent element
                text = $(el)
                  .contents()
                  .filter(function() { return this.nodeType === 3 || $(this).is('b, i') })
                  .text()
                  .trim()
              } else {
                // get all text
                text = $(el).text().trim()
              };
              (textContent as string[]).push(text)
            })
          } else {
            const $firstSelected = $selected.first()
            if (limit_text) {
              // only get the text within the parent element
              textContent = $firstSelected
                .contents()
                .filter(function() { return this.nodeType === 3 || $(this).is('b, i') })
                .text()
                .trim()
            } else {
              // get all text
              textContent = $firstSelected.text().trim()
            }
          }

          let parsed: string | string[]
          if (['title', 'version', 'description'].includes(type)) {
            parsed = ''
            if (regex) {
              const re = new RegExp(regex, 'g')
              if (queryAll && Array.isArray(textContent)) {
                // will be run on all SELECTOR matches and returns an array of string matches
                for (const str of textContent) {
                  const matches = [...str.matchAll(re)]
                  if (matches.length) {
                    const m = matches[0]
                    parsed = m.length > 1 ? m[1] : m[0]
                    break
                  }
                }
              } else {
                // just returns the regexMatch of the textcontent
                const matches = [...(textContent as string).matchAll(re)]
                const m = matches[0]
                parsed = m.length > 1 ? m[1] : m[0]
              }
            } else {
              // regex is null
              parsed = textContent
            }
            if (remove_regex) {
              const rem_re = new RegExp(remove_regex, 'g')
              parsed = (parsed as string).replaceAll(rem_re, '')
            }
          } else {
            parsed = []
            if (regex) {
              const re = new RegExp(regex, 'g')
              if (queryAll && Array.isArray(textContent)) {
                // run regex on each str of textContent
                textContent.forEach(str => {
                  const matches = [...str.matchAll(re)]
                  matches.forEach(m => {
                    if (m.length) {
                      (parsed as string[]).push(m.length > 1 ? m[1] : m[0])
                    }
                  })
                })
              } else if (typeof textContent === 'string') {
                // run regex on textContent str and return the matches
                const matches = [...textContent.matchAll(re)]
                matches.forEach(m => {
                  if (m.length) {
                    (parsed as string[]).push(m.length > 1 ? m[1] : m[0])
                  }
                })
              }
            } else {
              parsed = textContent
            }
            if (remove_regex) {
              const rem_re = new RegExp(remove_regex, 'g')
              parsed = (parsed as string[]).map(str => str.replaceAll(rem_re, ''))
            }
          }

          parsedSelectors.push({type, parsed})
        })

        return this.filterCustomSelectors(parsedSelectors)
      })
      .catch(err => {
        return err
      })
  }
}
