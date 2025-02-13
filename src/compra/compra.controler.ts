import { Request, Response, NextFunction, response } from 'express';
import { Compra } from './compra.entity.js';
import { orm } from '../shared/db/orm.js';
import { error } from 'console';
import { Populate } from '@mikro-orm/core';
import bcrypt from 'bcrypt';
import { Item } from '../item/item.entity.js';
import { Producto } from '../producto/producto.entity.js';
import { HistoricoPrecio } from '../historico_precio/historico_precio.entity.js';
import { populate } from 'dotenv';

const em = orm.em;

function sanitizeCompraInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body.sanitizedInput = {
    direccion_entrega: req.body.direccion_entrega,
    
    fecha_hora_compra: req.body.fecha_hora_compra,

    persona: req.body.persona,
    items:req.body.items,
    total_compra: req.body.total_compra,

    
    
  };
  //more checks here
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });
  next();
}


async function getOne(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const compra = await em.findOneOrFail(
        Compra,
        { id },
        { populate: [ 'persona','items.producto'] }
      );
      return res.status(200).json({ message: 'Compra finded', data: compra });
    } catch (error: any) {
      return res.status(404).json({ message: 'Compra not found' });
    }
  }


  async function add(req: Request, res: Response) {
    try {
      const { persona, items, direccion_entrega, fecha_hora_compra } = req.body.sanitizedInput;
      console.log('Datos recibidos para la compra:', req.body.sanitizedInput);
      // Verificamos que los items estén presentes y sean correctos
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "No se enviaron items para la compra" });
      }
    
      const compra = em.create(Compra, {
        direccion_entrega,
        fecha_hora_compra,
        persona,
        total_compra: 0,
      });
  
      let totalCompra = 0;

      for (const itemData of items) {
const productoId= itemData.producto;
const cantidad_producto= itemData.cantidad_producto;

        const producto = await em.findOne(Producto, { id: productoId });
        if (!producto) {
          return res.status(404).json({ message: "Producto no encontrado con id ${productoId}" });
        }
        const precioActual = await em.findOne(HistoricoPrecio, 
          { producto: productoId }, 
          { orderBy: { fechaDesde: 'DESC' } }
        );
        if (!precioActual) {
          return res.status(404).json({ message: "No se encontró historial de precios para el producto ${productoId}" });
        }
  
        const totalItem = cantidad_producto * precioActual.valor;
        totalCompra += totalItem;
        const existingItem = await em.findOne(Item, { producto: productoId, persona, compra:null });
        if (!existingItem) {
          return res.status(404).json({ message:" No se encontró el item con el producto ${productoId} y persona ${persona}" });
        }
  
        
        existingItem.compra = compra;
        compra.items.add(existingItem)
  
        
        await em.persistAndFlush(existingItem);
      }
    
     
    compra.total_compra = totalCompra;


    // Persistimos la compra y los items (aunque los items ya están persistidos, actualizamos la relación)
    await em.persistAndFlush(compra);

    return res.status(201).json({ message: 'Compra creada exitosamente', data: compra });
  } catch (error: any) {
    console.error('Error al crear la compra:', error);
    return res.status(500).json({ message: error.message });
  }
}



  async function getComprasByPersona(req: Request, res: Response) {
    const personaId = req.params.personaId;
    try {
     
      const compras = await em.find(Compra, { persona: personaId },
        { populate: ['items.producto'] } 
      );
  
      
      if (compras.length === 0) {
        return res.status(404).json({ message: 'Compra not found' });
      }
  
      
      return res.status(200).json({
        message: 'Compras found',
        data: compras,
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error al obtener compras', error });
    }
  }
  
  async function remove(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const compra = await em.findOneOrFail(Compra, { id }, { populate: ['items'] });

      await em.removeAndFlush(compra);
      return res
        .status(200)
        .json({ message: 'Compra deleted succesfully', data: compra });
    } catch (error: any) {
      return res.status(500).json({ message: 'Compra delete failed' });
    }
  }
  
  export { sanitizeCompraInput,getOne, add,  getComprasByPersona,remove};