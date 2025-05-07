import express, { NextFunction, Request, Response } from 'express';
import { personaRouter } from './persona/persona.routes.js';
import { ProductoRouter } from './producto/producto.routes.js';
import { categoriaRouter } from './categoria/categoria.routes.js';
import { EmpleadoRouter } from './empleado/empleado.routes.js';
import { HistoricoPrecioRouter } from './historico_precio/historico_precio.routes.js';
import { loginRouter } from './login/login.routes.js';
import { CompraRouter } from './compra/compra.routes.js';
import { DevolucionRouter } from './devolucion/devolucion.routes.js';
import { registerRouter } from './register/register.routes.js';
import { formaDePagoRouter } from './formaDePago/formasDePago.routes.js';
import { ItemRouter } from './item/item.routes.js';
import { EstadoSeguimientoRouter } from './estado_seguimiento/estado_seguimiento.routes.js';
import { SeguimientoRouter } from './seguimiento/seguimiento.routes.js';
import { LocalidadRouter } from './localidad/localidad.routes.js';
import { DireccionRouter } from './direccion/direccion.routes.js';
import { CorreoRouter } from './correo/correo.routes.js';
import { upload } from './middleware/upload.js';
import path from 'path';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { SECRET_JWT_KEY } from './login/login.controller.js';
import { RequestContext } from '@mikro-orm/core';
import cors from 'cors';
import jwt from 'jsonwebtoken';

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

// Serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Cookie parser for JWT
app.use(cookieParser(SECRET_JWT_KEY));

// JSON parsing middleware
app.use(express.json());

// Mikro-ORM context


// CORS configuration
app.use(
  cors({
    origin: ['http://localhost:4200'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  })
);

// Session handling
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: SECRET_JWT_KEY,
    name: 'session_token',
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
      sameSite: 'lax',
    },
  })
);

// JWT Authentication middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const token = req.signedCookies.access_token;
  req.session.user = undefined;
  if (token) {
    try {
      const data = jwt.verify(token, SECRET_JWT_KEY) as UserCookie;
      req.session.user = data;
    } catch (error) {
      console.log(error);
    }
  }
  next();
});

// Route handling
app.use('/api/personas', personaRouter);
app.use('/api/productos', ProductoRouter);
app.use('/api/categorias', categoriaRouter);
app.use('/api/empleados', EmpleadoRouter);
app.use('/api/historico-precios', HistoricoPrecioRouter);
app.use('/login', loginRouter);
app.use('/api/compras', CompraRouter);
app.use('/register', registerRouter);
app.use('/api/formas-de-pago', formaDePagoRouter);
app.use('/api/item', ItemRouter);
app.use('/api/devolucion', DevolucionRouter);
app.use('/api/estado-seguimiento', EstadoSeguimientoRouter);
app.use('/api/seguimiento', SeguimientoRouter);
app.use('/api/localidad', LocalidadRouter);
app.use('/api/direccion', DireccionRouter);
app.use('/api/correo', CorreoRouter);

// 404 handler
app.use((_, res) => {
  res.status(404).json({ message: 'Resource not found' });
});

export default app;
