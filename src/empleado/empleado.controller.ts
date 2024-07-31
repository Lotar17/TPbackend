import { Empleado } from './empleado.entity.js';
import { Request, Response, NextFunction } from 'express';

function sanitizeEmpleadoInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body.sanitizedInput = {
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    telefono: req.body.telefono,
    mail: req.body.mail,
    rol: req.body.string,
    nro_legajo: req.body.string,
  };
  //more checks here

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });

  next();
}

async function getAll(req: Request, res: Response) {}

async function getOne(req: Request, res: Response) {}

async function add(req: Request, res: Response) {}

async function update(req: Request, res: Response) {}

async function remove(req: Request, res: Response) {}

export {
  getAll,
  getOne,
  add,
  update,
  sanitizeEmpleadoInput as sanitizeCharacterInput,
  remove,
};
