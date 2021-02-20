const sessionFactory = require("./factories/sessionFactory");
const userFactory = require("./factories/userFactory");
const Page = require("./helpers/CustomPage");

let page;
beforeEach(async () => {
  // create a browser instance
  // browser = await puppeteer.launch({
  //   headless: false,
  // });
  // create a new tab on the browser
  // page = await browser.newPage();

  page = await Page.build(); // this line replaces above lines
  await page.goto("localhost:3000"); // visit localhost:3000
});

afterEach(async () => {
  // await browser.close();
  await page.close();
});

test("the header has the correct text", async () => {
  // const existingPage = (await browser.pages())[0]
  // await existingPage.goto('localhost:3000')

  // const text = await page.$eval("a.brand-logo", (el) => el.innerHTML);
  const text = await page.getContentsOf("a.brand-logo")
  expect(text).toEqual("Blogster");
});

test("To click login, and start OAuth flow", async () => {
  await page.click(".right a");
  const url = await page.url();
  expect(url).toMatch(/accounts\.google\.com/);
});

// .only means that we run this test only in this test file
// test.only("When signed in, shows logout button", async () => {
test("When signed in, shows logout button", async () => {
  await page.login('/');

  // const text = await page.$eval('a[href="/auth/logout"]', (el) => el.innerHTML);
  const text = await page.getContentsOf('a[href="/auth/logout"]')
  expect(text).toEqual("Logout");
});
