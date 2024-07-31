import { Request, Response, NextFunction, response } from 'express';
import { orm } from '../shared/db/orm.js';
import { Categoria } from './categoria.entity.js';

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
    const categorias = await em.find(Categoria, {});
    return res
      .status(200)
      .json({ message: 'Categorias finded', data: categorias });
  } catch (erro: any) {
    return res.status(404).json({ message: 'Categorias not finded' });
  }
}

async function getOne(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const categoria = await em.findOneOrFail(Categoria, id);
    return res
      .status(200)
      .json({ message: 'Categoria finded', data: categoria });
  } catch (error: any) {
    return res.status(404).json({ message: 'Categoria not finded' });
  }
}

async function add(req: Request, res: Response) {
  try {
    const categoria = em.create(Categoria, req.body.sanitizedInput);
    await em.flush();
    return res
      .status(201)
      .json({ message: 'Categoria created succesfully', data: categoria });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to add new Categoria' });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const categoria = em.getReference(Categoria, id);
    em.assign(categoria, req.body.sanitizedInput);
    await em.flush();
    return res
      .status(200)
      .json({ message: 'Categoria updated succesfully', data: categoria });
  } catch (error: any) {
    return res.status(500).json({ message: 'Categoria update failed' });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const categoria = em.getReference(Categoria, id);
    await em.removeAndFlush(categoria);
    return res
      .status(200)
      .json({ message: 'Categoria deleted succesfully', data: categoria });
  } catch (error: any) {
    return res.status(500).json({ message: 'Categoria delete failed' });
  }
}

export { getAll, getOne, add, update, sanitizeCharacterInput, remove };
