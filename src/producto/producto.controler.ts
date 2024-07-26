import { ProductoRepository } from './producto.repository.js';
import { Request, Response, NextFunction, response } from 'express';
import { Producto } from './producto.entity.js';

const repository = new ProductoRepository();

function sanitizeProductoInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body.sanitizedInput = {
    descripcion: req.body.descripcion,
    precio: req.body.precio,
    stock: req.body.stock,
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
  const producto = await repository.getOne({ id: id });
  if (!producto) {
    return res.status(404).json({ message: 'Producto not found' });
  } else {
    return res.status(200).json({ data: producto });
  }
}
async function add(req: Request, res: Response) {
  const producto = repository.add(req.params.id, req.body.sanitizedInput);
  if (!producto) {
    return res.status(403).json({ message: 'Producto creation failed' });
  } else {
    return res.status(201).json({
      message: 'Producto created succesfully',
      data: producto,
    });
  }
}
async function update(req: Request, res: Response) {
  req.body.sanitizedInput.id = req.params.id;
  const prodModify = await repository.update(
    req.params.id,
    req.body.sanitizedInput
  );
  if (!prodModify) {
    return res.status(404).json({ message: 'Producto not found' });
  } else {
    return res
      .status(200)
      .json({ message: 'Producto updated succesfully', data: prodModify });
  }
}

async function remove(req: Request, res: Response) {
  const id = req.params.id;
  const prodRemoved = await repository.delete({ id: id });
  if (!prodRemoved) {
    return res.status(404).json({ message: 'Producto not found' });
  } else {
    return res
      .status(200)
      .json({ message: 'Producto REMOVED succesfully', data: prodRemoved });
  }
}
export { sanitizeProductoInput, getAll, getOne, add, update, remove };
