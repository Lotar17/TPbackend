import express from 'express';

const app = express();

app.use('/', (req, res) => {
  res.send('<h1>Holaa</h1>');
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
