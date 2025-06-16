// Neco Porterを意識していない普通のNode.jsアプリ
const express = require('express');
const app = express();

// 多くのアプリがこのパターンを使用
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send(`Hello! Running on port ${port}`);
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});