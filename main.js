const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const pathSymbol = Symbol('path');

app.use(cors());

const ExistFileMiddleware = function (req, res, next) {
  const existKey = Reflect.has(req.query, 'fileName');
  if (!existKey) {
    return res.sendStatus(400);
  }
  const fileName = Reflect.get(req.query, 'fileName');
  const filePath = path.resolve(__dirname, `./assets/${fileName}`);
  const existFile = fs.existsSync(filePath);
  if (!existFile) {
    return res.sendStatus(400);
  }
  Reflect.set(req, pathSymbol, filePath);
  next();
};

app.get('/size', ExistFileMiddleware, (req, res) => {
  const filePath = Reflect.get(req, pathSymbol);
  const size = fs.statSync(filePath).size;

  res.send({
    size
  });
});

app.options('/download', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Headers', 'Range');
  next();
});

app.get('/download', ExistFileMiddleware, (req, res) => {
  const filePath = Reflect.get(req, pathSymbol);
  res.download(filePath, {
    acceptRanges: true
  });
});

// 目前仅支持一级目录文件
app.get('/files', (req, res) => {
  const dirPath = path.resolve(__dirname, './assets');
  const existDir = fs.existsSync(dirPath);
  const result = [];

  if (!existDir) {
    fs.mkdirSync(dirPath);
  }

  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      result.push(file);
    }
  }

  res.send(result);
});

app.use('*', (req, res) => {
  res.send('404');
});

app.listen(3000, () => {
  console.log('listening on port 3000');
});
