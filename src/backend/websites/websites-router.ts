/* eslint-disable import/no-relative-packages */
/* eslint-disable promise/no-callback-in-promise */
import { Router } from 'express'
import axios from 'axios'

import * as Games from '../games/games-model'
import SiteScraper from './website-scraper'

import { SettingsType } from '../../types'


const router = Router()

async function getSettings(): Promise<SettingsType> {
  const res = await axios.get('http://localhost:9000/settings')
  return res.data
}


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

router.post('/scrape', (req, res, next) => {
  const makeSiteScraper = async () => {
    const categories = await Games.getCategories()
    categories.forEach(cat => {
      cat.options = cat.options.split(',')
    })
    const tags = await Games.getTags()
    const statuses = await Games.getStatus()
    const settings = await getSettings()
    return new SiteScraper(categories, statuses, tags, settings.site_scrapers, settings.site_scraper_aliases)
  }
  const {
    base_url,
    url
  }: {
    base_url: string,
    url: string
  } = req.body
  makeSiteScraper()
    .then(siteScraper => {
      siteScraper.scrape(url, base_url)
        .then(response => {
          console.log(response)
          res.status(200).json(response)
        })
        .catch(err => next({message:err}))
    })
    .catch(err => next({message: err}))
})

module.exports = router
