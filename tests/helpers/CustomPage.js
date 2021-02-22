const puppeteer = require("puppeteer");
const sessionFactory = require("../factories/sessionFactory");
const userFactory = require("../factories/userFactory");

class CustomPage {
  static async build() {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });

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

    await this.page.goto("http://localhost:3000"); // make sure the cookie is set for the right website.
    await this.page.setCookie({ name: "session", value: session });
    await this.page.setCookie({ name: "session.sig", value: sig });
    // refresh the page, to cuase the page re-render, so that we can have the updated header
    await this.page.goto(`http://localhost:3000${url}`);

    // test logout button
    // const text = await page.$eval('.right li:nth-child(2) a', el => el.innerHTML)
    // waitFor wait until the selector element is rendered.
    await this.page.waitFor('a[href="/auth/logout"]'); // in case the test program runs faster than rendering
  }

  async getContentsOf(selector) {
    return this.page.$eval(selector, (el) => el.innerHTML);
  }

  get(path) {
    return this.page.evaluate((_path) => {
      return fetch(_path, {
        method: "GET",
        credentials: "same-origin", // by default, Fetch does not include cookies on request
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.json());
    }, path);
  }

  post(path, data) {
    return this.page.evaluate(
      (_path, _data) => {
        return fetch(_path, {
          method: "POST",
          credentials: "same-origin", // by default, Fetch does not include cookies on request
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(_data),
        }).then((res) => res.json());
      },
      path,
      data
    );
  }
}

module.exports = CustomPage;
