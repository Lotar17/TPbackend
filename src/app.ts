import 'reflect-metadata';
import express, { NextFunction, Request, Response } from 'express';
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
import session from 'express-session';
import { SECRET_JWT_KEY } from './login/login.controller.js';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

type UserCookie = {
  id: number;
  apellido: string;
  nombre: string;
  mail: string;
  rol: string;
};

// Augment express-session with a custom SessionData object
declare module 'express-session' {
  interface SessionData {
    user: UserCookie;
  }
}

const app = express();
app.use(cookieParser(SECRET_JWT_KEY));

app.use(express.json());

app.use((req, res, next) => {
  RequestContext.create(orm.em, next);
});

app.use(
  cors({
    origin: ['http://localhost:4200'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: SECRET_JWT_KEY,
    name: 'session_token',
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
      sameSite: 'none',
      secure: process.env.NODE_ENV === 'production',
    },
  })
);

app.use((req: Request, res: Response, next: NextFunction) => {
  const token = req.signedCookies.access_token;
  console.log('Lo que tiene la cookies firmadas es', req.signedCookies);
  req.session.user = undefined;
  if (token) {
    try {
      const data = jwt.verify(token, SECRET_JWT_KEY) as UserCookie;
      req.session.user = data;
    } catch (error) {
      console.log(error);
    }
  }
  next(); // -> seguir a la siguiente ruta o middleware
});

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
