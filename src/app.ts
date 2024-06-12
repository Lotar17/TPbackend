import express from 'express';
import { personaRouter } from './persona/persona.routes.js';

const app = express();
app.use(express.json());

app.use('/api/personas', personaRouter);
app.use((_, res) => {
  res.status(404).json({ message: 'Resource not found' });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
