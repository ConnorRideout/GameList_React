// TODO: implement this in website-scrapers
import browserManager from "./website-browser"


export default async function login(login_url: string, username_selector: string, username: string, password_selector: string, password: string, submit_selector: string) {
  const page = await browserManager.browser!.newPage()

  await page.goto(login_url)
  // wait for possible ddos blocker
  if (page.url() !== login_url) {
    console.log("Currently on DDoS blocker, waiting for redirect...")
    await page.waitForNavigation({waitUntil: 'networkidle2'})
    console.log("DDoS passed")
  }
  // type credentials
  await page.locator(username_selector).fill(username)
  await page.locator(password_selector).fill(password)
  // submit credentials
  await page.locator(submit_selector).click()
  await page.waitForNavigation({waitUntil: 'networkidle2'})

  console.log(`Successfully logged in to "${login_url}"`)

  return page
}

// `await page.goto(url)` goes to a new page
// `await page.content()` for the content that gets passed to cheerio
