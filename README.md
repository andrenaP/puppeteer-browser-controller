# PBK

This project allows you to take screenshots of websites using Puppeteer and Firefox.

## Features

- Capture screenshots of websites using Puppeteer.
- Navigate, click, and interact with web pages before capturing screenshots.

## Prerequisites

- **Node.js** (version 18 or later)
- **Firefox** (installed on your system)
- **timg** (installed on your system)
- **Setup tmp** (run this to create a soft link to tmp) `ln -s /tmp tmp`

## Setup

**Install Dependencies**

```bash
npm i
```

**Configure Firefox**

Ensure you have the correct path for your Firefox profile in .env or you can path it in docker:

```bash
FIREFOX_PATH_LOCAL='Here is path to you firefox profile'
```

**Run**

```bash
npm start
```

## Docker

**Build the project**
```
docker build -t einkviewer .
```

**Then run it.**

```docker
docker run -ti --rm -p 3000:3000 -e FIREFOX_PATH_LOCAL="your-path-to-profile" einkviewer npm start
```

## API

### post /execute
Execute the command
```json
{"script": "await page.goto('http://localhost:8080/', { waitUntil: 'networkidle2' });", "commandId": 1},
```

###  post /shutdown
Shutdown the browser