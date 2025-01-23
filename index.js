const puppeteer = require("puppeteer");
const readline = require("readline");
const path = require("path");
const { spawn } = require("child_process");
require("dotenv").config();


const express = require('express');
const vm = require('vm');



const app = express();
app.use(express.json());

let browser; // Puppeteer browser instance
let page; // Single Puppeteer page instance
let context; // VM context

const SCREENSHOTS_DIR=`/tmp/`


//console.log(process.env);
const Profile = path.resolve(process.env.FIREFOX_PATH_LOCAL);
console.log("Loading Profile from:", Profile);



// Initialize Puppeteer and create a browser and page
(async () => {
  const browser = await puppeteer.launch({
    product: "firefox", // Use Firefox
    browser: "firefox", // Use Firefox
    headless: true, // Disable headless mode for GUI
    userDataDir: Profile,

    // executablePath: "/usr/bin/firefox", // Adjust the path to your Firefox binary
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      // `--load-extension=${extensionPath}`,
      // `--disable-extensions-except=${extensionPath}`,
      `-P "${Profile}"`, // Path to the preconfigured Firefox profile
    ], // For compatibility
  })

  page = await browser.newPage();
  
  // Create a VM context with Puppeteer objects
  context = {
      browser,
      page,
      screenshotIMG: null, // Holds the latest screenshot image
      console,
  };
  vm.createContext(context); // Contextify the object
  console.log('Puppeteer browser launched and VM context created');
})();


// Endpoint to execute user-provided scripts in the VM
app.post("/execute", async (req, res) => {
  const { script, commandId } = req.body;
  if (!script) return res.status(400).send("Missing script to execute");

  try {
    // Wrap the user-provided script in an async function and execute it
    const wrappedScript = `
            (async () => {
                ${script}
            })();
        `;
    await vm.runInContext(wrappedScript, context);

    // Take a screenshot after the script execution
    const screenshotPath = SCREENSHOTS_DIR+ `screenshot_${commandId}.bmp`
    await page.screenshot({ path: screenshotPath, type: "bmp" });

    // Send the screenshot file back as the response
    res.sendFile(screenshotPath, { root: "." }, (err) => {
      if (err) console.error("Error sending screenshot:", err);
    });
  } catch (error) {
    console.error("Error executing script:", error);
    res.status(500).send(`Error executing script: ${error.message}`);
  }
});

// Close the browser and cleanup on shutdown
app.post("/shutdown", async (req, res) => {
  try {
    await browser.close();
    res.send("Browser closed");
  } catch (error) {
    console.error("Error closing browser:", error);
    res.status(500).send("Error closing browser");
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));