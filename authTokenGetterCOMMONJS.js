const puppeteer = require("puppeteer");
const fs = require("fs").promises;
const fetch = require("node-fetch");
require("dotenv").config();

const PASSWORD = process.env.PASSWORD;
const USERNAME = process.env.USERNAME;

async function getAuthToken(password = PASSWORD, username = USERNAME) {
  var cookies = [{}];
  return new Promise(async (resolve, reject) => {
    let authToken = "";
    const cookiesString = await fs.readFile("cookies.json", "utf8");
    cookies = JSON.parse(cookiesString);
    let tVal = "";
    if (Object.keys(cookies).length > 0) {
      cookies.forEach((c) => {
        if (c.name == "t") {
          tVal = c.value;
        }
      });
    }
    if (tVal != "") {
      const name = await fetch(
        `https://gannacademy.myschoolapp.com/api/webapp/context?t=${tVal}`,
      )
        .then((response) => response.json())
        .then((data) => {
          return +data.MasterUserInfo.StudentDisplay;
        });
      if (name != "") {
        resolve(tVal);
        return;
      } else {
        console.log("t token invalid");
        var cookies = cookies.filter((item) => item.name !== "t");
      }
    }
    const browser = await puppeteer.launch({
      headless: true,
      userDataDir: "./user_data",
    });
    const page = await browser.newPage();

    try {
      if (Object.keys(cookies).length > 0) {
        await page.setCookie(...cookies);
      }
      const cookieToDelete = (await page.cookies()).find((c) => c.name === "t");
      if (cookieToDelete) {
        await page.deleteCookie(cookieToDelete);
      }
    } catch (error) {
      console.error("Error reading cookies file:", error.message);
      await page.close();
      await browser.close();
      reject(error);
      return;
    }

    const frameNavigatedListener = async (frame) => {
      const url = frame.url();
      const pageCookies = await page.cookies();

      saveCookiesTemp(page, cookies);
      setTimeout(() => {}, 4000);
      if (
        url.includes("student#studentmyday/schedule") &&
        Object.keys(cookies).length > 0
      ) {
        const authTokenCookie = cookies.find((cookie) => cookie.name === "t");

        if (authTokenCookie) {
          page.removeAllListeners();
          page.off("framenavigated", frameNavigatedListener);
          await saveCookies(page, cookies);
          authToken = authTokenCookie.value;
          await browser.close();
          resolve(authToken);
          return;
        }
      } else if (url.includes("app/student#login")) {
        try {
          await page.waitForSelector("#remember");
          await page.evaluate(() => {
            document.getElementById("remember").checked = true;
          });
        } catch (error) {}
        try {
          await page.waitForSelector("#Username");
          await page.evaluate(() => {
            document.getElementById("Username").value = username;
          });
          await page.waitForSelector("#nextBtn");
          await page.click("#nextBtn");
          await page.waitForFunction(
            () => {
              const usernameInput = document.getElementById("Username");
              return usernameInput && usernameInput.disabled;
            },
            { timeout: 10000 },
          );
          console.log("Username input is disabled. Sign-in failed.");
        } catch (error) {
          if (error.name === "TimeoutError") {
            console.log(
              "Timeout reached. Username input may not have become disabled.",
            );
          } else {
            console.error(error);
          }
        }
      } else if (
        url.includes(
          "https://login.microsoftonline.com/gannacademy.org/oauth2/authorize?login_hint",
        )
      ) {
        try {
          await page.waitForSelector("#i0118");
          await page.evaluate(() => {
            document.querySelector("#i0118").value = password;
          });
          await page.waitForSelector("#idSIButton9");
          await page.click("#idSIButton9");
        } catch (error) {}
        try {
          await page.waitForSelector("#passwordError");
          console.log("Password incorrect");
          reject("Password incorrect");
        } catch (error) {}
      } else if (
        url.includes("https://login.microsoftonline.com/gannacademy.org/login")
      ) {
        await page.waitForSelector("#idSIButton9");
        await page.click("#idSIButton9");
      }
    };

    page.on("framenavigated", frameNavigatedListener);
    await page.goto(
      "https://gannacademy.myschoolapp.com/app/student#studentmyday/schedule",
    );
  });
}

module.exports = { getAuthToken };

async function saveCookiesTemp(page, cookies) {
  const newCookies = await page.cookies();

  newCookies.forEach((newCookie) => {
    const existingCookieIndex = cookies.findIndex(
      (existingCookie) => existingCookie.name === newCookie.name,
    );

    if (existingCookieIndex !== -1) {
      cookies[existingCookieIndex].value = newCookie.value;
    } else {
      cookies.push(newCookie);
    }
  });
  return cookies;
}

async function saveCookies(page, cookies) {
  const newCookies = await page.cookies();
  try {
    newCookies.forEach((newCookie) => {
      const existingCookieIndex = cookies.findIndex(
        (existingCookie) => existingCookie.name === newCookie.name,
      );

      if (existingCookieIndex !== -1) {
        cookies[existingCookieIndex].value = newCookie.value;
      } else {
        cookies.push(newCookie);
      }
    });

    await fs.writeFile("cookies.json", JSON.stringify(cookies, null, 2));

    console.log("Cookies updated successfully!");
  } catch (error) {
    if (error.code === "ENOENT") {
      await fs.writeFile("cookies.json", JSON.stringify(newCookies, null, 2));
      console.log("Cookies file created with initial values.");
    } else {
      console.error("Error updating cookies:", error);
    }
  }
}
