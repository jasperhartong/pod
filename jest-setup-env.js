// setup file for jest
const dotenv = require("dotenv");
const fs = require("fs");

// Read from .env_template, which contains variable to at least not crash the tests when ran on CI
dotenv.config({ path: "./.env_template" });

// Overwrite with .env
try {
  const envConfig = dotenv.parse(fs.readFileSync("./.env"));
  for (let k in envConfig) {
    process.env[k] = envConfig[k];
  }
} catch (error) {
  console.error(error);
}
