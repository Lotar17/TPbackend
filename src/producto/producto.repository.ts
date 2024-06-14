import { Repository } from "../shared/repository.js";
import { Producto } from "./producto.entity.js";

const productos : Producto[] = []

export class ProductoRepository implements Repository <Producto>{
    public getAll(): Producto[] | undefined {
        return productos
    }
    public getOne(item: { id: string; }): Producto | undefined {
        return productos.find((Producto) => Producto.id === item.id)
    }
    public add(item: Producto): Producto | undefined {
        const productoExistente = productos.find((Producto) => Producto.id === item.id)
        if(productoExistente){
            return undefined
        } else {
        productos.push(item)
        return item }
    }
    public update(item: Producto): Producto | undefined {
        const productoIndex = productos.findIndex((Producto)=>Producto.id === item.id)
        if(productoIndex !== -1){
            productos[productoIndex] = {...productos[productoIndex],...item}
        }
        return productos[productoIndex]
    }
    public delete(item: { id: string; }): Producto | undefined {
        const productoIndex = productos.findIndex((Producto)=>Producto.id === item.id)
        
        if(productoIndex !== -1){
            const prodEliminado = productos[productoIndex]
            productos.splice(productoIndex,1)
            return prodEliminado 
        }
    }
}
