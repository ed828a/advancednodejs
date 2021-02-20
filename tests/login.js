const Page = require("puppeteer/lib/Page");
const sessionFactory = require("./factories/sessionFactory");
const userFactory = require("./factories/userFactory");

Page.prototype.login = async function () {
  const user = await userFactory();
  const { session, sig } = sessionFactory(user);

  await this.goto("localhost:3000"); // make sure the cookie is set for the right website.
  await this.setCookie({ name: "session", value: session });
  await this.setCookie({ name: "session.sig", value: sig });
  // refresh the page, to cuase the page re-render, so that we can have the updated header
  await this.goto("localhost:3000");

  // test logout button
  // const text = await page.$eval('.right li:nth-child(2) a', el => el.innerHTML)
  // waitFor wait until the selector element is rendered.
  await page.waitFor('a[href="/auth/logout"]'); // in case the test program runs faster than rendering
};

const buildPage = (CustomPage) => {
  const page = new Page();
  const customPage = new CustomPage(page);

  const superPage = new Proxy(customPage, {
    get: function (target, property) {
      return target[property] || page[property];
    },
  });

  return superPage;
};

class CustomPage {
  static build() {
    const page = new Page();
    const customPage = new CustomPage(page);

    const superPage = new Proxy(customPage, {
      get: function (target, property) {
        return target[property] || page[property];
      },
    });

    return superPage;
  }
  
  constructor(page) {
    this.page = page
  }

  login() {
    this.page.goto('localhost:3000')
    this.page.setCookie()
  }
}
