import 'reflect-metadata';
import express from 'express';
import { personaRouter } from './persona/persona.routes.js';
import { ProductoRouter } from './producto/producto.routes.js';
import { categoriaRouter } from './categoria/categoria.routes.js';
import { EmpleadoRouter } from './empleado/empleado.routes.js';
import { orm } from './shared/db/orm.js';
import { RequestContext } from '@mikro-orm/core';
import { HistoricoPrecioRouter } from './historico_precio/historico_precio.routes.js';
import { loginRouter } from './login/login.routes.js';
import { CompraRouter } from './compra/compra.routes.js';
import { METHODS } from 'http';
import cors from 'cors';
import { registerRouter } from './register/register.routes.js';
import { formaDePagoRouter } from './formaDePago/formasDePago.routes.js';

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  RequestContext.create(orm.em, next);
});

app.use(
  cors({
    origin: ['http://localhost:4200'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  })
);

app.use('/api/personas', personaRouter);
app.use('/api/productos', ProductoRouter);
app.use('/api/categorias', categoriaRouter);
app.use('/api/empleados', EmpleadoRouter);
app.use('/api/historico-precios', HistoricoPrecioRouter);
app.use('/login', loginRouter);
app.use('/api/compras', CompraRouter);
app.use('/register', registerRouter);
app.use('/api/formas-de-pago', formaDePagoRouter);

app.use((_, res) => {
  res.status(404).json({ message: 'Resource not found' });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
