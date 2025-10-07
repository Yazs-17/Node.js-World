## Description

更强大的日志系统，对标[morgan](../morgan/README.Express.morgan.md)

更流行的日志库

用法示例：
```js
// logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info', // 可选：error, warn, info, http, verbose, debug, silly
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/app.log' }),
  ],
});

module.exports = logger;


// server.js
const express = require('express');
const logger = require('./logger');
const app = express();

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  logger.info('Home page visited');
  res.send('Hello, world!');
});

app.listen(3000, () => logger.info('Server started on port 3000'));


```



## Usage

## Installation

## Test

