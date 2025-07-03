import puppeteer from "puppeteer-extra"
import StealthPlugin from "puppeteer-extra-plugin-stealth"
import axios from "axios"

import type { Browser, Page } from "puppeteer"
// eslint-disable-next-line import/no-relative-packages
import { LoginType } from "../../types"


// puppeteer.use(StealthPlugin())

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
        headless: false,
        // add args to hide automation
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      })
    }
    return this.browser
  }

  async close() {
    if (this.browser) {
      await this.browser.close()
      console.log('Browser closed')
      this.browser = null
    }
  }

  async loginToSite(website_id: number) {
    // FIXME: often, the DDoS blocker will need human input to work
    const page = await this.browser!.newPage()

    // add realistic headers to attempt to avoid DDoS blocker
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')

    const login: LoginType | undefined = (await axios.get(`http://localhost:9000/settings/login/${website_id}`)).data
    if (!login || !login.login_url) {
      return {page, error: undefined}
    }
    const {login_url, username_selector, username, password_selector, password, submit_selector} = login as Record<string, string>

    await page.goto(login_url, {waitUntil: 'networkidle2'})
    // wait for possible ddos blocker
    if (page.url() !== login_url) {
      console.log("Currently appears on DDoS blocker, waiting for redirect...")
      await page.waitForNavigation({waitUntil: 'networkidle2'})
      console.log("DDoS passed")
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
    return {url: page.url(), error}
  }
}

const browserManager = new BrowserManager()

module.exports = browserManager
export default browserManager
