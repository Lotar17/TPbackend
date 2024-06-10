import express from 'express';
import { PersonaRepository } from './persona/persona.repository.js';

const app = express();
app.use(express.json());

app.use('/', (req, res) => {
  res.send('<h1>Holaa</h1>');
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
