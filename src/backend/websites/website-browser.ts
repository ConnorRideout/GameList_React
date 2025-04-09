import puppeteer, {Browser} from "puppeteer"


class BrowserManager {
  browser: Browser | null

  constructor() {
    this.browser = null
  }

  async launch() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({headless: false})
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
}

const browserManager = new BrowserManager()

module.exports = browserManager
export default browserManager
