import { getAuthToken } from "./authTokenGetter.js";

// For CommonJS (using require instead of import)
// const { getAuthToken } = require("./authTokenGetter");

async () => {
  const t = await getAuthToken();
  // do something with token
  // fetch(`apiRoute&t=${t}`)
};
