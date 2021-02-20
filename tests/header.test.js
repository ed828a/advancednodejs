const puppeteer = require("puppeteer");
const sessionFactory = require('./factories/sessionFactory')
const userFactory = require('./factories/userFactory')

let browser, page;
beforeEach(async () => {
  // create a browser instance
  browser = await puppeteer.launch({
    headless: false,
  });

  // create a new tab on the browser
  page = await browser.newPage();
  await page.goto("localhost:3000"); // visit localhost:3000
});

afterEach(async () => {
  await browser.close();
});

test("the header has the correct text", async () => {
  // const existingPage = (await browser.pages())[0]
  // await existingPage.goto('localhost:3000')

  const text = await page.$eval("a.brand-logo", (el) => el.innerHTML);
  expect(text).toEqual("Blogster");
});

test("To click login, and start OAuth flow", async () => {
  await page.click(".right a");
  const url = await page.url();
  expect(url).toMatch(/accounts\.google\.com/);
});

// .only means that we run this test only in this test file
// test.only("When signed in, shows logout button", async () => {
test ("When signed in, shows logout button", async () => {
  // this id is from MongoDB, it's real data
  // const userId = "6029f187c07b08049067fa4d";
  const user = await userFactory()
  const { session, sig } = sessionFactory(user)
  
  await page.goto('localhost:3000') // make sure the cookie is set for the right website.
  await page.setCookie({ name: 'session', value: session })
  await page.setCookie({ name: 'session.sig', value: sig })
  // refresh the page, to cuase the page re-render, so that we can have the updated header
  await page.goto('localhost:3000')

  // test logout button
  // const text = await page.$eval('.right li:nth-child(2) a', el => el.innerHTML)
  // waitFor wait until the selector element is rendered.
  await page.waitFor('a[href="/auth/logout"]'); // in case the test program runs faster than rendering

  
  const text = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML)
  expect(text).toEqual('Logout')

});
    