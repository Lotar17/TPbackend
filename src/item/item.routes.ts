import { Router } from "express";
import {
    sanitizeItemInput,

    getOne,
   remove,
    getCarrito,
   decrementQuantity,
   createItem,
   updateItem,
   incrementarCantidad,
   addToCart1,
   validoExistencia
   
  } from './item.controller.js';

  export const ItemRouter= Router();

  
 ItemRouter.get('/:id',getOne)
  ItemRouter.delete('/:idItem', remove);
  ItemRouter.get('/persona/:personaId',getCarrito);
  ItemRouter.post('/decrementa',sanitizeItemInput,decrementQuantity);
  ItemRouter.post('/create',sanitizeItemInput,createItem);
  ItemRouter.put('/update/:idItem',sanitizeItemInput,updateItem)
  ItemRouter.patch('/incrementaItem',sanitizeItemInput,incrementarCantidad)
  ItemRouter.post('/add',sanitizeItemInput,addToCart1)
  ItemRouter.get('/valido/:idProducto/:idPersona',validoExistencia)