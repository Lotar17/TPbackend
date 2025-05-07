import { Request, Response, NextFunction, response } from 'express';
import { Producto } from './producto.entity.js';
import { orm } from '../shared/db/orm.js';
import { HistoricoPrecio } from '../historico_precio/historico_precio.entity.js';
import { ObjectId } from '@mikro-orm/mongodb';
import { error } from 'console';
import { ValidationError } from '../Errores/validationErrors.js';
const em = orm.em.fork();
import { Persona } from '../persona/persona.entity.js';

function sanitizeProductoInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body.sanitizedInput = {
    id: req.body.id,
    descripcion: req.body.descripcion,
    precio: req.body.precio,
    stock: req.body.stock,
    categoria: req.body.categoriaId,
    persona: req.body.personaId,
    personaMail: req.body.personaMail,
    detalle:req.body.detalle,
    photoPath: req.file?.filename, // lo pongo opcional pq puede no cargarle imagenes

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
  //VALIDADO
  try {
    const descripcion = req.query.descripcion as string;
    const personaId = req.params.idPersona;
    if (!personaId) {
      throw new ValidationError('El parametro idPersona es requerido');
    }
    const persona = await em.findOne(Persona, { id: personaId });
    let productos;
    if (!persona) {
      throw new ValidationError('La persona no se encontro');
    }

    if (descripcion) {
      productos = await em.find(
        Producto,
        {
          descripcion: new RegExp(descripcion, 'i'), // Coincidencia parcial, insensible a mayúsculas/minúsculas

          persona: { $ne: personaId },

          // hace que traiga todos los productos que no son del cliente que inicio sesion
        },
        {
          populate: ['persona', 'categoria', 'hist_precios'],
        }
      );
    } else {
      // Si no se proporciona descripción, devolver todos los productos
      productos = await em.find(
        Producto,
        { persona: { $ne: personaId } },
        {
          populate: ['persona', 'categoria', 'hist_precios'],
        }
      );
    }

    return res
      .status(200)
      .json({ message: 'Productos encontrados', data: productos });
  } catch (error: any) {
    if (error instanceof ValidationError) {
      return res.status(401).json({ message: error.message });
    }
    console.error('Error al buscar productos:', error);
    return res.status(500).json({
      message: 'Error interno al buscar productos',
      error: error.message,
    });
  }
}

async function getAllAdmin(req: Request, res: Response) {
  try {
    const productos = await em.find(
      Producto,
      {},
      { populate: ['persona', 'categoria', 'hist_precios'] }
    );
    return res
      .status(200)
      .json({ message: 'Todos los productos devueltos', data: productos });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: error.data });
  }
}

async function getOne(req: Request, res: Response) {
  //VALIDADO
  try {
    const id = req.params.id;
    const producto = await em.findOne(
      Producto,
      { id },
      { populate: ['categoria', 'hist_precios', 'persona'] }
    );
    if (!producto) {
      throw new ValidationError('Producto no encontrado');
    }
    return res.status(200).json({ message: 'Producto finded', data: producto });
  } catch (error: any) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ message: error.message });
    }
  }
}



async function add(req: Request, res: Response) { 
  try {
    console.log("pasa por el sanitized",req.body.sanitizedInput);
    console.log(req.file);
    const precio = req.body.sanitizedInput.precio;
    if(precio <= 0){
throw new ValidationError('El precio debe ser positivo')
    }
    if(req.body.sanitizedInput.stock<=0){
      throw new ValidationError('El stock ingresado debe ser positivo')
    }
    delete req.body.sanitizedInput.precio;
    if (!req.body.sanitizedInput.persona) {
      try {
        const persona = await em.findOneOrFail(Persona, {
          mail: req.body.sanitizedInput.personaMail,
        });
        req.body.sanitizedInput.persona = persona._id;
      } catch (error: any) {
        console.log(error);
        delete req.body.sanitizedInput.personaMail;
      }
    }
    const producto = em.create(Producto, req.body.sanitizedInput);
    const histPrecio: HistoricoPrecio = {
      valor: precio,
      fechaDesde: new Date(),
      producto: producto,
    };
    const historicoPrecioNuevo = em.create(HistoricoPrecio, histPrecio);
    await em.flush();
    res.status(201).send({ message: 'Registro exitoso', result: true,data: producto });
  } catch (error: any) {
    console.log(error);
    if (error instanceof ValidationError) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).send({ message: 'Error interno del servidor', result: false })

  
  }
}
async function update(req: Request, res: Response) { //Validado
  try {
    const id = req.params.id;

    
    const producto = await em.findOneOrFail(
      Producto,
      { id },
      { populate: ['hist_precios', 'persona'] }
    );

    // Actualizar el producto con los campos enviados en el cuerpo de la solicitud (parciales)
    if (!req.body.sanitizedInput.persona) {
      try {
        const persona = await em.findOneOrFail(Persona, {
          mail: req.body.sanitizedInput.personaMail,
        });
        req.body.sanitizedInput.persona = persona._id;
      } catch (error: any) {
        console.log(error);
        delete req.body.sanitizedInput.personaMail;
      }
    }
    const sanitizedInput = req.body.sanitizedInput;

    if ('stock' in sanitizedInput && (typeof sanitizedInput.stock !== 'number' || sanitizedInput.stock < 0)) {
      return res.status(400).json({ message: 'El stock debe ser un número positivo' });
    }


    em.assign(producto, sanitizedInput); // Asigna de forma parcial lo que se pasa en sanitizedInput


    // Si el precio está siendo actualizado, maneja el historial de precios
    if (sanitizedInput.precio !== undefined) {
      const precioExiste = producto.hist_precios.find(
        (precio) => precio.valor === sanitizedInput.precio
      );

      // Si ya existe ese precio, actualiza la fecha
      if (precioExiste) {
        const idPrecio = precioExiste.id;
        const precio = await em.findOneOrFail(HistoricoPrecio, {
          id: idPrecio,
        });
        em.assign(precio, { fechaDesde: new Date() });
      } else {
        // Si no existe ese precio, crea un nuevo historial de precio
        const precio: HistoricoPrecio = {
          valor: sanitizedInput.precio,
          fechaDesde: new Date(),
          producto: producto,
        };
        em.create(HistoricoPrecio, precio);
      }
    }

    // Persiste todos los cambios
    await em.flush();

    return res
      .status(200)
      .json({ message: 'Producto updated successfully', data: producto });
  } catch (error: any) {
    console.log(error);
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
async function actualizarStock(req: Request, res: Response) {// Ver este metodo
  try {
    console.log('✅ Body recibido en el backend:');
    console.log(JSON.stringify(req.body, null, 2)); // Verifica qué datos llegan

    if (!Array.isArray(req.body)) {
      return res.status(400).json({
        message:
          'El formato de datos es incorrecto, debe ser un array de productos.',
      });
    }

    for (const productoData of req.body) {
      console.log('🔹 Procesando producto:', productoData);

      if (!productoData.id) {
        console.error('🚨 ERROR: Producto sin ID', productoData);
        return res.status(400).json({
          message: 'Cada producto debe incluir un ID para actualizarlo.',
        });
      }

      const producto = await em.findOne(Producto, {
        _id: new ObjectId(productoData.id),
      });

      if (!producto) {
        console.error('⚠ Producto no encontrado con ID:', productoData.id);
        return res.status(404).json({
          message: `Producto con ID ${productoData.id} no encontrado`,
        });
      }

      console.log(
        `✅ Producto encontrado (${productoData.id}), actualizando stock...`
      );
      em.assign(producto, { stock: productoData.stock });
      em.persist(producto);
    }

    await em.flush();
    res.status(200).json({ message: 'Stock actualizado correctamente' });
  } catch (error) {
    console.error('❌ Error al actualizar stock:', error);
    res.status(500).json({ message: 'Error al actualizar stock' });
  }
}

async function getProductsByUser(req: Request, res: Response) {
  try {
    const idUser = req.params.idPersona;
    const productos = await em.find(Producto, {
      persona: idUser,
    });

    if (productos.length === 0) {
      return res
        .status(404)
        .json({ message: 'No se encontraron productos para ese usuario' });
    }
    return res.status(200).json({
      message: 'Productos para el usuario encontrados',
      data: productos,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener productos' });
  }
}

export {
  sanitizeProductoInput,
  getAll,
  getOne,
  actualizarStock,
  add,
  update,
  remove,
  getProductsByUser,
  getAllAdmin,
};
