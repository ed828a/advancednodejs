
const puppeteer = require("puppeteer");
const sessionFactory = require("../factories/sessionFactory");
const userFactory = require("../factories/userFactory");

class CustomPage {
  static async build() {
    const browser = await puppeteer.launch({ headless: false });

    const page = await browser.newPage();
    const customPage = new CustomPage(page);

    return new Proxy(customPage, {
      get: function (target, property) {
        return customPage[property] || browser[property] || page[property];
      },
    });
  }

  constructor(page) {
    this.page = page;
  }

  async login(url) {
    const user = await userFactory();
    const { session, sig } = sessionFactory(user);

    await this.page.goto("localhost:3000"); // make sure the cookie is set for the right website.
    await this.page.setCookie({ name: "session", value: session });
    await this.page.setCookie({ name: "session.sig", value: sig });
    // refresh the page, to cuase the page re-render, so that we can have the updated header
    await this.page.goto(`localhost:3000${url}`);

    // test logout button
    // const text = await page.$eval('.right li:nth-child(2) a', el => el.innerHTML)
    // waitFor wait until the selector element is rendered.
    await this.page.waitFor('a[href="/auth/logout"]'); // in case the test program runs faster than rendering
  }

  async getContentsOf(selector) {
    return this.page.$eval(selector, el => el.innerHTML)
  }
}

module.exports = CustomPage;
