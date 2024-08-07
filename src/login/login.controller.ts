import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/orm.js';
import { Persona } from '../persona/persona.entity.js';
import { ValidationError } from './loginErrors.js';
import bcrypt from 'bcrypt';

const em = orm.em;

function sanitizeLoginInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    mail: req.body.mail,
    password: req.body.password,
  };
  //more checks here

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
    if (!user) throw new ValidationError('El usuario no existe');
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid)
      throw new ValidationError('La contraseña ingresada no es correcta');
    res.status(200).send({ message: 'Linda papi' });
  } catch (error) {
    if (error instanceof ValidationError)
      res.status(401).send({ message: error.message });
  }
}

export { sanitizeLoginInput, loginUser };
