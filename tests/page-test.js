const puppeteer = require("puppeteer");

test("To launch the browser", async () => {
  // create a browser instance
  browser = await puppeteer.launch({
    headless: false,
  });

  const existingPage = (await browser.pages())[0];
  await existingPage.goto("localhost:3000");
  
});
