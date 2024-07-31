import { HistoricoPrecio } from './historico_precio.entity.js';
import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/orm.js';

const em = orm.em;

function sanitizePrecioInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    valor: req.body.valor,
    fechaDesde: req.body.fechaDesde,
    producto: req.body.producto,
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
    const precios = await em.find(HistoricoPrecio, {});
    return res
      .status(200)
      .json({ message: 'Precios historicos finded', data: precios });
  } catch (error: any) {
    return res.status(404).json({ message: error.message });
  }
}

async function getOne(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const precio = await em.findOneOrFail(HistoricoPrecio, { id });
    return res
      .status(200)
      .json({ message: 'Precio historico finded', data: precio });
  } catch (error: any) {
    return res.status(404).json({ message: 'Precio Historico not found' });
  }
}

async function add(req: Request, res: Response) {
  try {
    const precio = em.create(HistoricoPrecio, req.body.sanitizedInput);
    await em.flush();
    return res
      .status(201)
      .json({ message: 'Precio historico created succesfully', data: precio });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const precio = await em.findOneOrFail(HistoricoPrecio, { id });
    em.assign(precio, req.body.sanitizedInput);
    await em.flush();
    return res
      .status(200)
      .json({ message: 'Precio historico updated succesfully', data: precio });
  } catch (error: any) {
    return res.status(500).json({ message: 'Precio update failed' });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const precio = em.getReference(HistoricoPrecio, id);
    await em.removeAndFlush(precio);
    return res
      .status(200)
      .json({ message: 'Precio historico deleted succesfully', data: precio });
  } catch (error: any) {
    return res.status(500).json({ message: 'Precio delete failed' });
  }
}

export { getAll, getOne, add, update, sanitizePrecioInput, remove };
