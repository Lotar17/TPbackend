import { ObjectId } from 'mongodb';
export class Producto {
  constructor(
    public descripcion: string,
    public precio: number,
    public stock: number,
    public _id = ObjectId
  ) {}
}
