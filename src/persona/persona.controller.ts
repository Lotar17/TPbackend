import { Persona } from './persona.entity.js';
import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/orm.js';
import { error } from 'console';
import { Populate } from '@mikro-orm/core';
import bcrypt from 'bcrypt';
import { Localidad } from '../localidad/localidad.entity.js';
import { Direccion } from '../direccion/direccion.entity.js';
import { ValidationError } from '../Errores/validationErrors.js';

const em = orm.em;

function sanitizePersonaInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    telefono: req.body.telefono,
    mail: req.body.mail,
    prods_publicados: req.body.prods_publicados,
    password: req.body.password ? bcrypt.hashSync(req.body.password, 10) : undefined,// Si en el put o en el patch no se pone un password tira error
    passwordAnterior:req.body.passwordAnterior,
    passwordNueva:req.body.passwordNueva,
    rol: req.body.rol,
    carrito:req.body.carrito,
    direccion:req.body.direccion,
    calle:req.body.calle,
    numero:req.body.numero,
    localidadId:req.body.localidadId
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
    const persona = await em.find(
      Persona,
      {},
      { populate: ['prods_publicados','carrito']
       }
    );

    return res
      .status(200)
      .json({ message: 'found all persons', data: persona });
  } catch (error: any) {
    return res.status(500).json({ message: error.data });
  }
}

async function getOne(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const persona = await em.findOneOrFail(
      Persona,
      { id },
      { populate: ['prods_publicados','estados_empleados.seguimiento.cliente.direccion.localidad','estados_empleados.localidad','direccion','compras.direccion','estados_empleados.seguimiento.item.compra.direccion.localidad'] }
    );
    // const { password, ...personaData } = persona;
    return res.status(200).json({ message: 'found person', data: persona });
  } catch (error: any) {
    return res.status(500).json({ message: error.data });
  }
}

async function add(req: Request, res: Response) {
  try {
    const {
      nombre,
      apellido,
      telefono,
      mail,
      prods_publicados,
      password,
      carrito,
      rol,
      calle,
      numero,
      localidadId,
    } = req.body.sanitizedInput;

    const localidad = await em.findOne(Localidad, { id: localidadId });
    if (!localidad) {
      return res.status(404).json({ message: 'Localidad no encontrada' });
    }

    const direccion = em.create(Direccion, {
      calle,
      numero,
      localidad:localidadId,
    });
    await em.persistAndFlush(direccion);
    
    const persona = em.create(Persona, {
      nombre,
      apellido,
      telefono,
      mail,
      prods_publicados,
      password,
      carrito,
      rol,
      direccion:direccion
    })

    await em.persistAndFlush(persona);

    
    return res
      .status(200)
      .json({ message: 'Person Created succesfully !', data: persona });
  } catch (error: any) {
    return res.status(500).json({ message: error.data });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const personaToUpdate = await em.findOneOrFail(Persona, { id });
    em.assign(personaToUpdate, req.body.sanitizedInput);
    await em.flush();
    return res
      .status(200)
      .json({ message: 'Person updated succesfully !', data: personaToUpdate });
  } catch (error: any) {
    return res.status(500).json({ message: 'error' });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const persona = em.getReference(Persona, id);
    await em.removeAndFlush(persona);
    return res
      .status(200)
      .json({ message: 'Person deleted succesfully !', data: persona });
  } catch (error: any) {
    return res.status(500).json({ message: error.data });
  }
}

async function updatePassword(req: Request, res: Response) {
  try {
    const { mail, passwordAnterior, passwordNueva } = req.body.sanitizedInput;

    const user = await em.findOne(Persona, { mail: mail });
    if (!user) {
      throw new ValidationError('El usuario es incorrecto');
    }

    const isValid = await bcrypt.compare(passwordAnterior, user.password);
    if (!isValid) {
      throw new ValidationError('La contraseña o el usuario es incorrecto');
    }

    user.password = await bcrypt.hash(passwordNueva, 10);
    console.log("Nuevo hash:", user.password);
em.persist(user); // Forzamos que MikroORM lo tome como una entidad a guardar
await em.flush();


    return res.status(200).json({
      message: 'Password updated successfully!',
      data: { id: user.id, mail: user.mail },
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(401).send({ message: error.message, result: false });
    } else {
      console.error(error);
      res.status(500).send({ message: 'Error interno del servidor', result: false });
    }
  }
}

export {
  getAll,
  getOne,
  add,
  update,
  sanitizePersonaInput as sanitizeCharacterInput,
  remove,
  updatePassword
};
