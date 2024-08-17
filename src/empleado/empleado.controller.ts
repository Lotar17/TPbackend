import { Empleado } from './empleado.entity.js';
import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/orm.js';
import { error } from 'console';
import { Populate } from '@mikro-orm/core';
import bcrypt from 'bcrypt';


const em = orm.em;

function sanitizeEmpleadoInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body.sanitizedInput = {
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    telefono: req.body.telefono,
    email: req.body.email,
    compras:req.body.compras,
  
   
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
    const empleado = await em.find(
      Empleado,
      {},
      { populate: ['compras'] }
    );

    return res
      .status(200)
      .json({ message: 'found all persons', data: empleado });
  } catch (error: any) {
    return res.status(500).json({ message: error.data });
  }
}

async function getOne(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const empleado = await em.findOneOrFail(
      Empleado,
      { id },
      { populate: ['compras'] }
    );
   
    return res.status(200).json({ message: 'found employ', data: empleado });
  } catch (error: any) {
    return res.status(500).json({ message: error.data });
  }
}


async function add(req: Request, res: Response) {
  try {
    const empleado = em.create(Empleado, req.body.sanitizedInput);
    await em.flush();
    return res
      .status(200)
      .json({ message: 'Employ Created succesfully !', data: empleado });
  } catch (error: any) {
    return res.status(500).json({ message: error.data });
  }}

  async function update(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const empleadoToUpdate = await em.findOneOrFail(Empleado, { id });
      em.assign(empleadoToUpdate, req.body.sanitizedInput);
      await em.flush();
      return res
        .status(200)
        .json({ message: 'Employ updated succesfully !', data: empleadoToUpdate });
    } catch (error: any) {
      return res.status(500).json({ message: 'error' });
    }
  }

  async function remove(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const empleado = em.getReference(Empleado, id);
      await em.removeAndFlush(empleado);
      return res
        .status(200)
        .json({ message: 'Employ deleted succesfully !', data: empleado });
    } catch (error: any) {
      return res.status(500).json({ message: error.data });
    }
  }
  
  export {
    getAll,
    getOne,
    add,
    update,
    sanitizeEmpleadoInput as sanitizeCharacterInput,
    remove,
  };