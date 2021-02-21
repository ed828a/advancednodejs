const Page = require("./helpers/CustomPage");

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto("localhost:3000");
});

afterEach(async () => {
  // console.log("page.close: ", page.close);
  await page.close();
});

test("when login, can see blog create form", async () => {
  await page.login("/blogs");
  const text = await page.getContentsOf(".btn-floating.red .material-icons");
  expect(text).toEqual("add");
});

// test("when login, can see blog create form", async () => {
//   await page.login("/blogs");
//   await page.click("a.btn-floating");

//   const label = await page.getContentsOf("form label");
//   expect(label).toEqual("Blog Title");
// });

describe("When logged in", async () => {
  // this will execute before each test case inside this describe
  beforeEach(async () => {
    await page.login("/blogs");
    await page.click("a.btn-floating");
  });

  test("can see blog create form", async () => {
    const label = await page.getContentsOf("form label");
    expect(label).toEqual("Blog Title");
  });

  describe("And using invalid inputs", async () => {
    beforeEach(async () => {
      await page.click("form button.teal");
    });

    test("the form shows an error message", async () => {
      const errorTitle = await page.getContentsOf(".title .red-text");
      const errorContent = await page.getContentsOf(".content .red-text");
      expect(errorTitle).toEqual("You must provide a value");
      expect(errorContent).not.toBeNull();
    });
  });

  describe("And using valid inputs", async () => {
    beforeEach(async () => {
      await page.type(".title input", "The first Test blog");
      await page.type(".content input", "This is the first test blog Added");
      await page.click("form button.teal");
    });
    test("Submitting takes user to review screen", async () => {
      const text = await page.getContentsOf("form h5");
      expect(text).toEqual("Please confirm your entries");
    });

    test("Submitting then saving adds blog to index page", async () => {
      await page.click("button.green");
      await page.waitFor(".card");

      const title = await page.getContentsOf(".card-title");
      const content = await page.getContentsOf("p");
      // because each test create a new user, and this post is the only post the user has
      expect(title).toEqual("The first Test blog");
      expect(content).toEqual("This is the first test blog Added");
    });
  }); 
});

 // we want to make sure that the page can't make a blog post request to the server
 describe("User is not logged in", async () => {
  test("User can not create blog posts", async () => {
    // run AJAX functions using Page.evaluate()
    const result = await page.evaluate(() => {
      
      return fetch("/api/blogs", {
        method: "POST",
        credentials: "same-origin", // by default, Fetch does not include cookies on request
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "My title",
          content: "My Content",
        }),
      }).then(res => res.json());

    });

    // console.log('result: ', result)
    expect(result).toEqual({ error: 'You must log in!' }) 
  });

  test("User can not view blogs", async () => {
    // run AJAX functions using Page.evaluate()
    const result = await page.evaluate(() => {
      
      return fetch("/api/blogs", {
        method: "GET",
        credentials: "same-origin", // by default, Fetch does not include cookies on request
        headers: {
          "Content-Type": "application/json",
        }        
      }).then(res => res.json());

    });

    // console.log('result: ', result)
    expect(result).toEqual({ error: 'You must log in!' }) 
  });

});
