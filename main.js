const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const pathSymbol = Symbol('path');

app.use(cors());

const ExistFileMiddleware = function (req, res, next) {
  const existKey = Reflect.has(req.query, 'fileName');
  if (!existKey) {
    return res.sendStatus(400);
  }
  const fileName = Reflect.get(req.query, 'fileName');
  const filePath = `./assets/${fileName}`;
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

app.get('/files', (req, res) => {
  const files = fs.readdirSync('./assets');
  res.send(files);
});

app.use('*', (req, res) => {
  res.send('404');
});

app.listen(3000, () => {
  console.log('listening on port 3000');
});
