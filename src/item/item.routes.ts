import { Router } from "express";
import {
    sanitizeItemInput,
    addToCart,
    getOne,
   remove,
    getCarrito,
   decrementQuantity,
   createItem,
   updateItem
   
  } from './item.controller.js';

  export const ItemRouter= Router();

  ;
  ItemRouter.post('/', sanitizeItemInput, addToCart);
 ItemRouter.get('/:id',getOne)
  ItemRouter.delete('/:idItem', remove);
  ItemRouter.get('/persona/:personaId',getCarrito);
  ItemRouter.post('/decrementa',sanitizeItemInput,decrementQuantity);
  ItemRouter.post('/create',sanitizeItemInput,createItem);
  ItemRouter.put('/update/:idItem',sanitizeItemInput,updateItem)