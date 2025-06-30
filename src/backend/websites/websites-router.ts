/* eslint-disable import/no-relative-packages */
/* eslint-disable promise/no-callback-in-promise */
import { Router } from 'express'
import axios from 'axios'

import browserManager from './website-browser'
import * as Games from '../games/games-model'
import SiteScraper from './website-scraper'

import { SettingsType } from '../../types'


const router = Router()

async function getSettings(): Promise<SettingsType> {
  const res = await axios.get('http://localhost:9000/settings')
  return res.data
}


router.post('/urlupdates', (req, res, next) => {
  const {check_url} = req.body
  getSettings()
    .then(settings => {
      const website_id = settings.site_scrapers.find(s => check_url.includes(s.base_url))?.website_id
      if (website_id === undefined) {
        fetch(check_url, {
          method: 'HEAD', // Use HEAD to fetch headers only
          redirect: 'follow' // Follow redirects
        })
          .then(response => {
            const redirectedUrl = response.redirected ? response.url : check_url
            res.status(200).json({message: check_url !== redirectedUrl ? 'updated' : 'no update', redirectedUrl})
          })
          .catch(next)
      } else {
        browserManager.getRedirectUrl(website_id, check_url)
          .then(redirectedUrl => {
            res.status(200).json({message: check_url !== redirectedUrl ? 'updated' : 'no update', redirectedUrl})
          })
          .catch(next)
      }
    })
    .catch(next)
})

router.post('/scrape', (req, res, next) => {
  // FIXME: scraping doesn't work
  // const makeSiteScraper = async () => {
  //   const categories = await Games.getCategories()
  //   categories.forEach(cat => {
  //     cat.options = cat.options.split(',')
  //   })
  //   const tags = await Games.getTags()
  //   const statuses = await Games.getStatus()
  //   const settings = await getSettings()
  //   return new SiteScraper(categories, statuses, tags, settings.site_scrapers)
  // }
  // const {
  //   website_id,
  //   url
  // }: {
  //   website_id: number,
  //   url: string
  // } = req.body
  // makeSiteScraper()
  //   .then(siteScraper => {
  //     siteScraper.scrape(url, website_id)
  //       .then(response => {
  //         console.log(response)
  //         res.status(200).json(response)
  //       })
  //       .catch(err => next({message:err}))
  //   })
  //   .catch(err => next({message: err}))
})

// router.post('/test', (req, res) => {
  // login(
  //   'https://f95zone.to/login/login',
  //   'input[name="login"]',
  //   'fuyocryden@gmail.com',
  //   'input[name="password"]',
  //   '%S2&R016wuBq*N',
  //   '.formSubmitRow button'
  // )
  // res.json('logged in')
// })

module.exports = router
