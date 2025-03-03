/* eslint-disable import/no-relative-packages */
/* eslint-disable promise/no-callback-in-promise */
import { Router } from 'express'
// import axios from 'axios'

import * as Games from '../games/games-model'
import SiteScraper from './website-scraper'

import { SettingsType } from '../../types'

const router = Router()

// let settings: SettingsType
// async function getSettings() {
//   const res = await axios.get('http://localhost:9000/settings')
//   return res.data
// }
// getSettings()
//   .then(set => {
//     settings = (set as any)
//   })
//   .catch(err => {
//     console.error(err)
//   })


router.post('/urlupdates', (req, res, next) => {
  async function getRedirectedUrl(url: string) {
    const response = await fetch(url, {
      method: 'HEAD', // Use HEAD to fetch headers only
      redirect: 'follow' // Follow redirects
    });

    // Check if the response is a redirect
    if (response.redirected) {
      return response.url; // This will give you the final URL after redirects
    } else {
      return url; // If no redirect, return the original URL
    }
  }
  const {checkUrl} = req.body
  getRedirectedUrl(checkUrl)
    .then(redirectedUrl => {
      res.status(200).json({message: checkUrl !== redirectedUrl ? 'updated' : 'no update', redirectedUrl})
    })
    .catch(next)
})

// TODO: parse equalities/renames the user has set (i.e. art: 2dcg = 2d)
router.post('/scrape', (req, res, next) => {
  const makeSiteScraper = async () => {
    const categories = await Games.getCategories()
    categories.forEach(cat => {
      cat.options = cat.options.split(',')
    })
    const tags = await Games.getTags()
    const statuses = await Games.getStatus()
    return new SiteScraper(categories, statuses, tags)
  }
  const {
    selectors,
    url
  }: {
    selectors: SettingsType['site_scrapers'][0]['selectors'],
    url: string
  } = req.body
  makeSiteScraper()
    .then(siteScraper => {
      siteScraper.scrape(url, selectors)
        .then(response => {
          res.status(200).json(response)
        })
        .catch(err => next({message:err}))
    })
    .catch(err => next({message: err}))
})

module.exports = router
