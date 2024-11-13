import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/orm.js';
import { FormaDePago } from './formaDePago.entity.js';

const em = orm.em;

function sanitizeCharacterInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body.sanitizedInput = {
    descripcion: req.body.descripcion,
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
    const formasDePago = await em.find(FormaDePago, {});
    return res
      .status(200)
      .json({ message: 'Formas de Pago finded', data: formasDePago });
  } catch (erro: any) {
    return res.status(404).json({ message: 'Formas de Pago not finded' });
  }
}

async function getOne(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const formaDePago = await em.findOneOrFail(FormaDePago, id);
    return res
      .status(200)
      .json({ message: 'FormaDePago finded', data: formaDePago });
  } catch (error: any) {
    return res.status(404).json({ message: 'FormaDePago not finded' });
  }
}

async function add(req: Request, res: Response) {
  try {
    const formaDePago = em.create(FormaDePago, req.body.sanitizedInput);
    await em.flush();
    return res
      .status(201)
      .json({ message: 'FormaDePago created succesfully', data: formaDePago });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to add new FormaDePago' });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const formaDePago = em.getReference(FormaDePago, id);
    em.assign(formaDePago, req.body.sanitizedInput);
    await em.flush();
    return res
      .status(200)
      .json({ message: 'FormaDePago updated succesfully', data: formaDePago });
  } catch (error: any) {
    return res.status(500).json({ message: 'FormaDePago update failed' });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const formaDePago = em.getReference(FormaDePago, id);
    await em.removeAndFlush(formaDePago);
    return res
      .status(200)
      .json({ message: 'FormaDePago deleted succesfully', data: formaDePago });
  } catch (error: any) {
    return res.status(500).json({ message: 'FormaDePago delete failed' });
  }
}

export { getAll, getOne, add, update, sanitizeCharacterInput, remove };
