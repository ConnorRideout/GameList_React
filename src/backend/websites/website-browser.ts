import fs from 'fs'
import path from 'path'
import puppeteer from "puppeteer-extra"
// import StealthPlugin from "puppeteer-extra-plugin-stealth"
import axios from "axios"

import type { Browser, Page } from "puppeteer"
// eslint-disable-next-line import/no-relative-packages
import { LoginType } from "../../types"


// puppeteer.use(StealthPlugin())
const cookies_path = path.join(__dirname, 'cookies.json')

class BrowserManager {
  browser: Browser | null

  pages: {website_id: number, page: Page}[]

  constructor() {
    this.browser = null
    this.pages = []
  }

  async launch() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        // headless: false,
        // add args to hide automation
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-blink-features=AutomationControlled',
        ],
        ignoreDefaultArgs: ['--enable-automation']
      })
      // get existing cookies
      if (fs.existsSync(cookies_path)) {
        const cookies = JSON.parse(fs.readFileSync(cookies_path, 'utf-8'))
        this.browser.setCookie(...cookies)
      }
    }
    return this.browser
  }

  async saveCookies() {
    console.log('saving cookies')
    if (!this.browser)
      return
    const cookies = await this.browser.cookies()
    fs.writeFileSync(cookies_path, JSON.stringify(cookies))
  }

  async close() {
    if (this.browser) {
      // save cookies
      await this.saveCookies()

      await this.browser.close()
      console.log('Browser closed')
      this.browser = null
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async checkIfOnDDoS(currentPage: Page) {
    try {
      const title = await currentPage.title()
      const content = await currentPage.content()

      const invalidIndicators = [
        'Just a moment',
        'Please wait',
        'Checking your browser',
        'DDoS protection',
        'Security check',
        'Please enable JavaScript and cookies', // Cloudflare
        'Ray ID:', // Another Cloudflare indicator
        'Performance & security by Cloudflare'
      ].map(i => i.toLowerCase())

      const isOnDDoS = invalidIndicators.some(indicator =>
        title.toLowerCase().includes(indicator) || title.toLowerCase().includes('ddos') || content.toLowerCase().includes(indicator)
      )
      console.log('Is On DDoS: ', isOnDDoS)
      return isOnDDoS
    } catch (error) {
      console.error('Failed to check if page is on DDoS: ', error)
      return false
    }
  }

  async askForDDoSInput(currentPage: Page, login_url: string) {
    console.log('asking for ddos input')
    // create the browser
    const headedBrowser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: [
        '--start-maximized',
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    })

    let cookies = await this.browser!.cookies()
    const user_agent = await currentPage.evaluate(() => navigator.userAgent)

    await headedBrowser.setCookie(...cookies)
    const page = await headedBrowser.newPage()
    await page.setUserAgent(user_agent)
    await page.goto(login_url, { waitUntil: 'networkidle2' })

    // wait for DDoS resolution
    try {
      await Promise.any([
        // option 1: wait for navigation and check if its not on DDoS
        // (async () => {
        //   await page.waitForNavigation({
        //     waitUntil: 'networkidle2',
        //     timeout: 45000
        //   })

        //   if (page.url() !== login_url || await this.checkIfOnDDoS(page)) {
        //     console.error('Navigation completed but not to expected URL')
        //     return { type: 'navigation', success: false, error: 'Wrong URL or DDoS' }
        //   }
        //   return { type: 'navigation', success: true }
        // }),
        // option 2: wait for the DDoS indicators to be gone
        new Promise<boolean>((resolve, reject) => {
          // eslint-disable-next-line no-undef
          let interval: NodeJS.Timeout

          const timeout = setTimeout(() => {
            clearInterval(interval)
            reject(new Error('DDoS was never bypassed'))
          }, 45000)

          interval = setInterval(async () => {
            const isOnDDoS = await this.checkIfOnDDoS(page)
            if (!isOnDDoS) {
              clearTimeout(timeout)
              clearInterval(interval)
              console.log('opt2: not ddos')
              resolve(true)
            }
          }, 500)
        })
      ])
    } catch (error) {
      console.error('Timeout waiting for DDoS resolution')
    }

    // switch back to the headless browser
    cookies = await headedBrowser.cookies()
    await this.browser!.setCookie(...cookies)
    await headedBrowser.close()
    await this.saveCookies() // make sure our good cookies are saved
  }

  async loginToSite(website_id: number) {
    // TODO: need to check if already logged in
    const page = await this.browser!.newPage()

    const login: LoginType | undefined = (await axios.get(`http://localhost:9000/settings/login/${website_id}`)).data
    if (!login || !login.login_url) {
      return {page, error: undefined}
    }
    const {login_url, username_selector, username, password_selector, password, submit_selector} = login as Record<string, string>

    await page.goto(login_url, {waitUntil: 'networkidle2'})
    // wait for possible ddos blocker
    if (page.url() !== login_url || (await page.title()).toLowerCase().includes('ddos')) {
      try {
        console.log("Currently appears on DDoS blocker, waiting for redirect...")
        await page.waitForNavigation({
          waitUntil: 'networkidle2',
          timeout: 10000
        })
        if (page.url() !== login_url || (await page.title()).toLowerCase().includes('ddos') )
          throw new Error('DDoS still present')
        console.log("DDoS passed")
      } catch (error) {
        await this.askForDDoSInput(page, login_url)
        await page.goto(login_url, {waitUntil: 'networkidle2'})
        if (page.url() !== login_url) {
          throw new Error('DDoS bypass failed!')
        }
      }
    }
    // type credentials
    await page.locator(username_selector).fill(username)
    await page.locator(password_selector).fill(password)
    // submit credentials
    await page.locator(submit_selector).click()
    await page.waitForNavigation({waitUntil: 'networkidle2'})
    // check if the page actually updated; if it didn't the username/password may be incorrect and should be noted to the user
    const error = page.url() === login_url ? `The URL "${login_url}" didn't update after login. This may mean your username and/or password for this site is incorrect.`: undefined

    if (!error)
      console.log(`Successfully logged in to "${login_url}"`)

    return {page, error}
  }

  async getPage(website_id: number) {
    if (!this.browser) {
      throw new Error('No Browser instance has been created')
    }
    const existingPage = this.pages.find(p => p.website_id === website_id)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {page, error}: {page: Page, error?: string} = existingPage || await this.loginToSite(website_id)
    if (!existingPage)
      this.pages.push({website_id, page})
    return {page, error}
  }

  async getPageContent(website_id: number, url: string) {
    const {page, error} = await this.getPage(website_id)

    await page.goto(url, {waitUntil: 'networkidle2'})
    const content = await page.content()
    return {content, error}
  }

  async getRedirectUrl(website_id: number, url: string) {
    const {page, error} = await this.getPage(website_id)

    await page.goto(url, {waitUntil: 'networkidle2'})
    return {redirectedUrl: page.url(), error}
  }
}

const browserManager = new BrowserManager()

module.exports = browserManager
export default browserManager
