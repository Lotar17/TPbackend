import { Request, Response, NextFunction, response } from 'express';
import { Compra } from './compra.entity.js';
import { orm } from '../shared/db/orm.js';
import { error } from 'console';
import { Populate } from '@mikro-orm/core';
import bcrypt from 'bcrypt';


const em = orm.em;

function sanitizeCompraInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body.sanitizedInput = {
    direccion_entrega: req.body.direccion_entrega,
    cantidad_producto: req.body.cantidad_producto,
    fecha_hora_compra: req.body.fecha_hora_compra,
//descuento: req.body.descuento,
    persona: req.body.persona,
    producto: req.body.producto,
    empleado: req.body.empleado,
    
    
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
    const compras = await em.find(Compra, {});
    return res
      .status(200)
      .json({ message: 'Compras finded', data: compras });
  } catch (error: any) {
    return res.status(404).json({ message: error.message });
  }
}

async function getOne(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const compra = await em.findOneOrFail(
        Compra,
        { id },
        { populate: ['empleado', 'persona','producto'] }
      );
      return res.status(200).json({ message: 'Compra finded', data: compra });
    } catch (error: any) {
      return res.status(404).json({ message: 'Compra not found' });
    }
  }

  async function add(req: Request, res: Response) {
    try {
      const compra = em.create(Compra, req.body.sanitizedInput);
      await em.flush();
      return res
        .status(201)
        .json({ message: 'Compra created succesfully', data: compra });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  async function update(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const compra = await em.findOneOrFail(Compra, { id });
      em.assign(compra, req.body.sanitizedInput);
      await em.flush();
      return res
        .status(200)
        .json({ message: 'Compra updated succesfully', data: compra });
    } catch (error: any) {
      return res.status(500).json({ message: 'Compra update failed' });
    }
  }

  async function remove(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const compra = em.getReference(Compra, id);
      await em.removeAndFlush(compra);
      return res
        .status(200)
        .json({ message: 'Compra deleted succesfully', data: compra });
    } catch (error: any) {
      return res.status(500).json({ message: 'Compra delete failed' });
    }
  }

  async function getComprasByPersona(req: Request, res: Response) {
    const personaId = req.params.personaId;
    try {
      // Buscar las compras asociadas al personaId
      const compras = await em.find(Compra, { persona: personaId });
  
      if (compras.length === 0) {
        return res.status(404).json({ message: 'Compra not found' });
      }
  
      return res.status(200).json({
        message: 'Compras found',
        data: compras
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error al obtener compras', error });
    }
  }
  
  export { sanitizeCompraInput, getAll, getOne, add, update, remove,getComprasByPersona };