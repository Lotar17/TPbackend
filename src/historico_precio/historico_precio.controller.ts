import { HistoricoPrecio } from './historico_precio.entity.js';
import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/orm.js';
import { Producto } from '../producto/producto.entity.js';
import { ValidationError } from '../Errores/validationErrors.js';

const em = orm.em;

function sanitizePrecioInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    valor: req.body.valor,
    fechaDesde: req.body.fechaDesde,
    productoId: req.body.producto,
  };
  //more checks here

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });

  next();
}

async function create(req: Request, res: Response) {
  try {
    console.log('📩 Datos recibidos:', req.body); // <-- Agregado para depurar
    const { valor,  productoId } = req.body;

   
    if (!productoId) {
      return res.status(400).json({ message: 'El productoId es obligatorio.' });
    }

    const producto = await em.findOne(Producto, { id: productoId });

    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado.' });
    }

    
    const fecha = new Date()
   

    
    let newPrecio = em.create(HistoricoPrecio, {
      valor,
      fechaDesde: fecha,
      producto,
    });

    await em.persistAndFlush(newPrecio);
    return res.status(201).json({ message: 'Histórico de precios creado con éxito.', data: newPrecio });

  } catch (error) {
    console.error('Error en create:', error);
    return res.status(500).json({ message: 'Error al crear el historial de precios.' });
  }
  
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
async function getPreciosHistoricos(req: Request, res: Response) { // VALIDADO
  

  try {
    const productoId = req.params.productoId;

  
    const preciosHistoricos = await em.find(HistoricoPrecio, {
      producto: productoId, 
      
    }, {
      orderBy: {
        fechaDesde: 'DESC', 
      },
    });

  
    if (preciosHistoricos.length === 0) {
      return res.status(404).json({ message: 'No se encontraron precios históricos para este producto' });
    }

    const precioActual = preciosHistoricos[0];
    
    return res.status(200).json({
      message: 'Precio actual encontrado',
      data: precioActual,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al buscar precios históricos' });
  }
}




export {create, getAll, getOne, add, update, sanitizePrecioInput, remove,getPreciosHistoricos};
