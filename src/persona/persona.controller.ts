import { Persona } from './persona.entity.js';
import { PersonaRepository } from './persona.repository.js';
import { Request, Response, NextFunction } from 'express';

const repository = new PersonaRepository();

function sanitizeCharacterInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body.sanitizedInput = {
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    telefono: req.body.telefono,
    mail: req.body.mail,
  };
  //more checks here

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });

  next();
}

function getAll(req: Request, res: Response) {
  return res.status(200).json({ data: repository.getAll() });
}

function getOne(req: Request, res: Response) {
  const id = req.params.id;
  const persona = repository.getOne({ id: id });
  if (!persona) {
    return res.status(404).json({ message: 'Persona not found' });
  }
  return res.status(200).json({ data: persona });
}

function add(req: Request, res: Response) {
  const { nombre, apellido, telefono, mail } = req.body.sanitizedInput;
  const personaInput = new Persona(nombre, apellido, telefono, mail);
  const persona = repository.add(personaInput);
  if (!persona) {
    return res.status(403).json({ message: 'Persona creation failed' });
  } else {
    return res.status(201).json({
      message: 'Persona created succesfully',
      data: persona,
    });
  }
}

function update(req: Request, res: Response) {
  req.body.sanitizedInput.id = req.params.id;
  const persona = repository.update(req.body.sanitizedInput);
  if (!persona) {
    return res.status(404).json({ message: 'Persona not found' });
  }
  return res
    .status(200)
    .json({ message: 'Persona updated succesfully', data: persona });
}

function remove(req: Request, res: Response) {
  const id = req.params.id;
  const persRemoved = repository.delete({ id: id });
  if (!persRemoved) {
    return res.status(404).json({ message: 'Persona not found' });
  } else {
    return res
      .status(200)
      .json({ message: 'Persona REMOVED succesfully', data: persRemoved });
  }
}

export { getAll, getOne, add, update, sanitizeCharacterInput, remove };
