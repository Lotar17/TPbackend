import { Request, Response, NextFunction, response } from 'express';
import { Producto } from './producto.entity.js';
import { orm } from '../shared/db/orm.js';

const em = orm.em;

function sanitizeProductoInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body.sanitizedInput = {
    descripcion: req.body.descripcion,
    precio: req.body.precio,
    stock: req.body.stock,
    categoria: req.body.categoria,
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
    const productos = await em.find(Producto, {});
    return res
      .status(200)
      .json({ message: 'Productos finded', data: productos });
  } catch (error: any) {
    return res.status(404).json({ message: error.message });
  }
}

async function getOne(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const producto = await em.findOneOrFail(
      Producto,
      { id },
      { populate: ['categoria', 'precios'] }
    );
    return res.status(200).json({ message: 'Producto finded', data: producto });
  } catch (error: any) {
    return res.status(404).json({ message: 'Producto not found' });
  }
}
async function add(req: Request, res: Response) {
  try {
    const producto = em.create(Producto, req.body.sanitizedInput);
    await em.flush();
    return res
      .status(201)
      .json({ message: 'Producto created succesfully', data: producto });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}
async function update(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const producto = await em.findOneOrFail(Producto, { id });
    em.assign(producto, req.body.sanitizedInput);
    await em.flush();
    return res
      .status(200)
      .json({ message: 'Producto updated succesfully', data: producto });
  } catch (error: any) {
    return res.status(500).json({ message: 'Producto update failed' });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const producto = em.getReference(Producto, id);
    await em.removeAndFlush(producto);
    return res
      .status(200)
      .json({ message: 'Producto deleted succesfully', data: producto });
  } catch (error: any) {
    return res.status(500).json({ message: 'Producto delete failed' });
  }
}
export { sanitizeProductoInput, getAll, getOne, add, update, remove };
