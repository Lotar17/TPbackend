import { Empleado} from './empleado.entity.js';
import { EmpleadoRepository } from './empleado.repository.js';
import { Request, Response, NextFunction } from 'express';

const repository = new EmpleadoRepository();

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
    rol:req.body.string,
     nro_legajo: req.body.string
  };
  //more checks here

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });

  next();
}

async function getAll(req: Request, res: Response) {
  return res.status(200).json({ data: await repository.getAll() });
}

async function getOne(req: Request, res: Response) {
  const id = req.params.id;
  const empleado = await repository.getOne({ id: id });
  if (!empleado) {
    return res.status(404).json({ message: 'Empleado not found' });
  }
  return res.status(200).json({ data: empleado });
}

async function add(req: Request, res: Response) {
  const { nombre, apellido, telefono, mail,rol, nro_legajo } = req.body.sanitizedInput;
  const empleadoInput = new Empleado(nombre, apellido, telefono, mail,rol,nro_legajo);
  const empleado= await repository.add(req.params.id,empleadoInput);
  if (!empleado) {
    return res.status(403).json({ message: 'Empleado creation failed' });
  } else {
    return res.status(201).json({
      message: 'Empleado created succesfully',
      data: empleado,
    });
  }
}

async function update(req: Request, res: Response) {
  const empleado = await repository.update(req.params.id,req.body.sanitizedInput);
  if (!empleado) {
    return res.status(404).json({ message: 'Empleado not found' });
  }
  return res
    .status(200)
    .json({ message: 'Empleado updated succesfully', data: empleado });
}

async function remove(req: Request, res: Response) {
  const id = req.params.id;
  const empRemoved = await repository.delete({ id: id });
  if (!empRemoved) {
    return res.status(404).json({ message: 'Empleado not found' });
  } else {
    return res
      .status(200)
      .json({ message: 'Empleado REMOVED succesfully', data: empRemoved });
  }
}

export { getAll, getOne, add, update, sanitizeEmpleadoInput as sanitizeCharacterInput, remove };