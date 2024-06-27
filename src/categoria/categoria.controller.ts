import { Categoria } from './categoria.entity.js';
import { CategoriaRepository } from './categoria.repository.js';
import { Request, Response, NextFunction } from 'express';

const repository = new CategoriaRepository();

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

function getAll(req: Request, res: Response) {
  return res.status(200).json({ data: repository.getAll() });
}

function getOne(req: Request, res: Response) {
  const id = req.params.id;
  const categoria = repository.getOne({ id: id });
  if (!categoria) {
    return res.status(404).json({ message: 'Categoria not found' });
  }
  return res.status(200).json({ data: categoria });
}

function add(req: Request, res: Response) {
  const { descripcion } = req.body.sanitizedInput;
  const categoriaInput = new Categoria(descripcion);
  const categoria = repository.add(categoriaInput);
  if (!categoria) {
    return res.status(403).json({ message: 'Categoria creation failed' });
  } else {
    return res.status(201).json({
      message: 'Categoria created succesfully',
      data: categoria,
    });
  }
}

function update(req: Request, res: Response) {
  req.body.sanitizedInput.id = req.params.id;
  const categoria = repository.update(req.body.sanitizedInput);
  if (!categoria) {
    return res.status(404).json({ message: 'Categoria not found' });
  }
  return res
    .status(200)
    .json({ message: 'Categoria updated succesfully', data: categoria });
}

function remove(req: Request, res: Response) {
  const id = req.params.id;
  const categoriaRemoved = repository.delete({ id: id });
  if (!categoriaRemoved) {
    return res.status(404).json({ message: 'Categoria not found' });
  } else {
    return res.status(200).json({
      message: 'Categoria REMOVED succesfully',
      data: categoriaRemoved,
    });
  }
}

export { getAll, getOne, add, update, sanitizeCharacterInput, remove };
