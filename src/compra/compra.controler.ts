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
import { Persona } from '../persona/persona.entity.js';

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
    estado: req.body.estado,
    personaId:req.body.personaId
    
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
      const { personaId, items, direccion_entrega, fecha_hora_compra } = req.body.sanitizedInput;
  
      console.log('Datos recibidos para la compra:', req.body.sanitizedInput);
  
      // Verificar si la persona existe
      const personaExistente = await em.findOne(Persona, { id: personaId });
      if (!personaExistente) {
        return res.status(404).json({ message: `Persona no encontrada con ID ${personaId}` });
      }
  
      // Crear la compra
      const compra = em.create(Compra, {
        direccion_entrega,
        fecha_hora_compra,
        persona: personaExistente,
        total_compra: 0,
        estado: 'en curso',
        
      });
  
      let totalCompra = 0;
  
      for (const itemData of items) {
        const productoId = itemData.producto.id;
        const cantidad_producto = itemData.cantidad_producto;
  
        console.log(`Buscando producto con ID: ${productoId}`);
  
        const producto = await em.findOne(Producto, { id: productoId });
        if (!producto) {
          return res.status(404).json({ message: `Producto no encontrado con ID ${productoId}` });
        }
  
        // Obtener el precio actual del producto
        const precioActual = await em.findOne(HistoricoPrecio, 
          { producto: productoId }, 
          { orderBy: { fechaDesde: 'DESC' } }
        );
  
        if (!precioActual) {
          return res.status(404).json({ message: `No se encontró historial de precios para el producto ${productoId}` });
        }
  
        const totalItem = cantidad_producto * precioActual.valor;
        totalCompra += totalItem;
  
        let existingItem = await em.findOne(Item, { producto: productoId, persona: personaExistente, compra: null });
  
        if (!existingItem) {
          existingItem = em.create(Item, {
            cantidad_producto,
            producto,
            persona: personaExistente,
            compra
          });
        } else {
          existingItem.compra = compra;
        }
  
        compra.items.add(existingItem);
        await em.persistAndFlush(existingItem);
      }
  
      // Asignar el total de la compra antes de guardar
      compra.total_compra = totalCompra;
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
    const compras = await em.find(
      Compra,
      { persona: personaId },
      { populate: ['items.producto'] }
    );

    // Filtrar compras que tienen items vacíos
    const comprasConItems = compras.filter(compra => compra.items.length > 0);

    if (comprasConItems.length === 0) {
      return res.status(404).json({ message: 'No se encontraron compras con productos' });
    }

    return res.status(200).json({
      message: 'Compras found',
      data: comprasConItems,
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

  async function update(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const compra = await em.findOneOrFail(Compra, { id },{ populate: ['items'] });
      em.assign(compra, req.body.sanitizedInput);
      await em.flush();
      return res
        .status(200)
        .json({ message: 'Compra updated succesfully', data: compra });
    } catch (error: any) {
      return res.status(500).json({ message: 'Compra update failed' });
    }
  }
  



  async function updateStock(req: Request, res: Response) {
    try {
      const idCompra = req.params.id;
  
      
      const compra = await em.findOne(Compra, { id: idCompra }, { populate: ['items.producto'] });
  
      if (!compra) {
        return res.status(404).json({ message: `Compra con ID ${idCompra} no encontrada` });
      }
  
      console.log('Datos de la compra:', compra);
  
      if (!compra.items || compra.items.length === 0) {
        return res.status(400).json({ message: "La compra no tiene items" });
      }
  
      const productosActualizados: Producto[] = [];
  
      for (const item of compra.items) {
        if (!item.producto || !item.producto.id) {
          console.error("Error: El item no tiene un producto válido:", item);
          return res.status(400).json({ message: "Uno de los items no tiene un producto válido" });
        }
  
        const producto = await em.findOne(Producto, { id: item.producto.id });
  
        if (!producto) {
          console.error(`Error: Producto con ID ${item.producto.id} no encontrado`);
          return res.status(404).json({ message: `Producto con ID ${item.producto.id} no encontrado` });
        }
  
       
        const nuevoStock = (producto.stock || 0) - item.cantidad_producto;
        if (nuevoStock < 0) {
          return res.status(400).json({ message: `No hay suficiente stock para el producto ${producto.descripcion}` });
        }
  

        em.assign(producto, { stock: nuevoStock });
        productosActualizados.push(producto);
      }
  
      
      await em.persistAndFlush(productosActualizados);
  
      return res.status(200).json({ message: "Stock actualizado correctamente" });
  
    } catch (error) {
      console.error("Error al actualizar stock:", error);
      return res.status(500).json({ message: "Error interno al actualizar stock" });
    }
  }
  



  export { sanitizeCompraInput,getOne, add,  getComprasByPersona,remove,update,updateStock};