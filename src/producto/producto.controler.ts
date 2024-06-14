import { ProductoRepository } from "./producto.repository.js";
import { Request, Response, NextFunction, response } from 'express';
import { Producto } from "./producto.entity.js";


const repository = new ProductoRepository()

function sanitizeProductoInput(
    req: Request,
    res: Response,
    next: NextFunction) {
    req.body.sanitizedInput = {
        descripcion : req.body.descripcion,
        precio : req.body.precio,
        stock : req.body.stock
    };
    //more checks here
    Object.keys(req.body.sanitizedInput).forEach((key) => {
        if (req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key];
        }
    });
    next();
}

function getAll(req: Request, res: Response) {
    return res.status(200).json({ data: repository.getAll() });
}

function getOne(req:Request,res:Response){
    const id = req.params.id
    const producto = repository.getOne({ id: id })
    if(!producto){
        return res.status(404).json({ message: 'Producto not found' });
    }else{
        return res.status(200).json({data: producto})
    }
}
function add (req: Request,res: Response){
    const {descripcion,precio,stock} = req.body.sanitizedInput
    const productoInput = new Producto(descripcion,precio,stock)
    const producto = repository.add(productoInput)
    if(!producto){
    return res.status(403).json({ message: 'Producto creation failed' });
    } else {
        return res.status(201).json({
            message: 'Producto created succesfully',
            data: producto})
        }
}
function update(req:Request,res:Response){
    req.body.sanitizedInput.id = req.params.id
    const prodModify = repository.update(req.body.sanitizedInput)
    if(!prodModify){
        return res.status(404).json({ message: 'Producto not found' });
    }else{
        return res.status(200).json(
            { message: 'Producto updated succesfully',
            data: prodModify });
    }
}

function remove(req: Request,res:Response){
    const id = req.params.id
    const prodRemoved = repository.delete({id:id}) 
    if(!prodRemoved){
        return res.status(404).json({ message: 'Producto not found' });
    }else{
        return res.status(200).json(
            {message: 'Producto REMOVED succesfully',
            data: prodRemoved});
    }
}
export {sanitizeProductoInput,getAll,getOne,add,update,remove}