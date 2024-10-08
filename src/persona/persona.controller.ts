import { Persona } from './persona.entity.js';
import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/orm.js';
import { error } from 'console';
import { Populate } from '@mikro-orm/core';
import bcrypt from 'bcrypt';

const em = orm.em;

function sanitizePersonaInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    telefono: req.body.telefono,
    mail: req.body.mail,
    prods_publicados: req.body.prods_publicados,
    password: req.body.password ? bcrypt.hashSync(req.body.password, 10) : undefined, // Si en el put o en el patch no se pone un password tira error
    rol: req.body.rol,
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
  try {
    const persona = await em.find(
      Persona,
      {},
      { populate: ['prods_publicados'] }
    );

    return res
      .status(200)
      .json({ message: 'found all persons', data: persona });
  } catch (error: any) {
    return res.status(500).json({ message: error.data });
  }
}

async function getOne(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const persona = await em.findOneOrFail(
      Persona,
      { id },
      { populate: ['prods_publicados'] }
    );
    // const { password, ...personaData } = persona;
    return res.status(200).json({ message: 'found person', data: persona });
  } catch (error: any) {
    return res.status(500).json({ message: error.data });
  }
}

async function add(req: Request, res: Response) {
  try {
    const persona = em.create(Persona, req.body.sanitizedInput);
    await em.flush();
    return res
      .status(200)
      .json({ message: 'Person Created succesfully !', data: persona });
  } catch (error: any) {
    return res.status(500).json({ message: error.data });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const personaToUpdate = await em.findOneOrFail(Persona, { id });
    em.assign(personaToUpdate, req.body.sanitizedInput);
    await em.flush();
    return res
      .status(200)
      .json({ message: 'Person updated succesfully !', data: personaToUpdate });
  } catch (error: any) {
    return res.status(500).json({ message: 'error' });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const persona = em.getReference(Persona, id);
    await em.removeAndFlush(persona);
    return res
      .status(200)
      .json({ message: 'Person deleted succesfully !', data: persona });
  } catch (error: any) {
    return res.status(500).json({ message: error.data });
  }
}

export {
  getAll,
  getOne,
  add,
  update,
  sanitizePersonaInput as sanitizeCharacterInput,
  remove,
};
