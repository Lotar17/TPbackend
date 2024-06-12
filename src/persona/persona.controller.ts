import { Persona } from './persona.entity.js';
import { PersonaRepository } from './persona.repository.js';
import { Request, Response, NextFunction } from 'express';

const repository = new PersonaRepository();

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
  const personaInput = new Persona(
    req.body.id,
    req.body.nombre,
    req.body.apellido,
    req.body.telefono,
    req.body.mail
  );
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

export { getAll, getOne, add };
