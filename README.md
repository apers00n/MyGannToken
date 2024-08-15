# This is a utility to get an auth token in a nodejs environment

## Explanation

It uses puppeteer to create a headless browser and log you in via MyGann. It saves the data in `user_data/` and the cookies in `cookies.json` so that it can get the token faster. As far as I know, this is the fastest method right now to get an auth token since they disabled a fast login. If someone finds a better method, let me know, but I think this is the best for now (or at least what I came up with that works).
> [!CAUTION]
> ALL OF THIS MAY STOP WORKING DEPENDING ON HOW BLACKBAUD CHANCES THE AUTH PROCESS. IT WORKS AS OF 2023 + 2024

## How to Use

- Create the same file pattern with `cookies.json`, `user_data/`, and the `authTokenGetter.js` of your choice
- One is built for CommonJS and one for ES. I don't really know the difference but one uses `require()` and one `import`
- To use `import`, you must add `"type": "module"` to your `package.json`
- Also create a `.env` file. This is very important both to keep your credentials secure and to let the code run. authTokenGetter by default tries to access it, but you may also pass in `password` and `username` into `getAuthToken()`
- The format should just be:

```dotenv
PASSWORD=MYPASSWORD
USERNAME=MYUSERNAME
```

- Your username should be your Gann email so `${gradYear}{firstInitial}${lastName}@gannacademy.org`
- There's an example of how to use it in `index.js`. It's not much but if you're new to js or just want to use the code really quickly then that's how.
- If you want to change it from being headless, so you can see the browser then just change `headless: true` to `false`

## Requirements

- All the things in `requirements.txt` should be downloaded with your preferred downloader (npm, pnpm, yarn, bun, etc.)
- I don't know if there's anything else

## Last Notes

- It's not my best written code. You're welcome to make a pull request if you have any fixes or improvements. Even if it's just removing unnecessary code or cleaning it up or making it type safe or adding parameters to `getAuthToken()`, I'm happy to add it. This really is a quick thing I wrote once that probably needs work. I mean the idea itself is just brute forcing the login.
- Also, if you want me to remove the `console.log()` statements then I'm happy to. I just didn't feel like it at the time, and it offers insight when running headless.
- I'm Natan Meyer '25. Feel free to reach out. I love writing code and have written a bunch of stuff dealing with MyGann like some of mygann+, an ios app built on react-native, a CLI for MyGann to access the main stuff (schedule, grades, assignments, directories, etc.), and I'm happy to help :)
