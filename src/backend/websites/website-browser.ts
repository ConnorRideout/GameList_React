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

  async close() {
    if (this.browser) {
      // save cookies
      const cookies = await this.browser.cookies()
      fs.writeFileSync(cookies_path, JSON.stringify(cookies))

      await this.browser.close()
      console.log('Browser closed')
      this.browser = null
    }
  }

  async askForDDoSInput(currentPage: Page, login_url: string) {
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
      await Promise.race([
        // strategy 1: wait for URL to match login_url
        page.waitForFunction(url => {
          return window.location.href === url
        }, { timeout: 30000 }, login_url),

        // strategy 2: wait for navigation to complete
        await page.waitForNavigation({
          waitUntil: 'networkidle2',
          timeout: 30000
        })
      ])
    } catch (error) {
      console.error('Timeout waiting for DDoS resolution')
    }

    // switch back to the headless browser
    cookies = await headedBrowser.cookies()
    await this.browser!.setCookie(...cookies)
    await headedBrowser.close()
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
    if (page.url() !== login_url) {
      try {
        console.log("Currently appears on DDoS blocker, waiting for redirect...")
        await page.waitForNavigation({
          waitUntil: 'networkidle2',
          timeout: 10000
        })
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
    console.log(password)
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
