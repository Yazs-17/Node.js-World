## Description

nodemon is a tool for Express that automatically restarts the server when file changes are detected.

## Usage

#### Install
```bash
node i -g nodemon
# or
npm install --save-dev nodemon
```

#### Usage
```bash
nodemon app.js
```

#### Config
config in package.json
```json
"scripts": {
  "start": "node app.js",
  "dev": "nodemon app.js"
}

```


