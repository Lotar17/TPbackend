import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/orm.js';
import { Persona } from '../persona/persona.entity.js';
import { ValidationError } from './loginErrors.js';
import bcrypt from 'bcrypt';
import session from 'express-session';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const em = orm.em;
export const SECRET_JWT_KEY = process.env.SECRET_JWT_KEY || 'nachovalenlotar';

function sanitizeLoginInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    mail: req.body.mail,
    password: req.body.password,
  };

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });

  next();
}

async function loginUser(req: Request, res: Response) {
  const { mail, password } = req.body.sanitizedInput;
  console.log(mail);
  try {
    const user = await em.findOne(Persona, { mail: mail });
    if (!user)
      throw new ValidationError('La contraseña o el usuario es incorrecto');
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid)
      // || !user
      throw new ValidationError('La contraseña o el usuario es incorrecto');
    const token = jwt.sign(
      {
        id: user.id,
        mail: user.mail,
        nombre: user.nombre,
        apellido: user.apellido,
        rol: user.rol,
      },
      SECRET_JWT_KEY,
      {
        expiresIn: '1h',
      }
    );
    res.cookie('access_token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
      sameSite: 'none',
      secure: true,
      signed: true,
    });
    res.status(200).send({
      message: 'Usuario logueado',
      result: true,
      usuarioId: user._id?.toString(),
      userRol: user.rol?.toString(),
    });
  } catch (error) {
    if (error instanceof ValidationError)
      res.status(401).send({ message: error.message, result: false });
  }
}

async function getRolByCookie(req: Request, res: Response) {
  req.sessionStore.get(req.cookies.session_token, (error, session) => {
    if (error) {
      console.log('Sesion no encontrada');
    }
    if (session) {
      return session;
    }
  });
  const { user } = req.session;
  console.log(
    `El usuario conectado es ${user?.nombre} ${user?.apellido} con rol de ${user?.rol}`
  );
  res.status(200).send({
    message: user ? 'Rol encontrado con exito' : 'Usuario no encontrado',
    data: user?.rol,
  });
  console.log(`Preguntaron por el rol del usuario ${user?.nombre}`);
}

async function getUserInformation(req: Request, res: Response) {
  const sid = req.signedCookies.session_token;
  console.log('Cookies recibidas:', req.signedCookies);

  console.log(sid);
  if (sid !== undefined) {
    req.sessionStore.get(sid, (error, session) => {
      if (session) {
        const user = session.user;
        console.log(
          `El usuario conectado es ${user?.nombre} ${user?.apellido} con rol de ${user?.rol}`
        );
        res.status(200).send({
          message: 'Usuario encontrado con exito',
          data: user,
        });
        console.log(`Preguntaron por el rol del usuario ${user?.nombre}`);
      }
    });
  } else {
    res.status(200).send({
      message: 'Usuario no encontrado',
    });
  }
}

export { sanitizeLoginInput, loginUser, getRolByCookie, getUserInformation };