import crypto from 'node:crypto';
export class Producto{
    constructor(
        public descripcion : string,
        public precio: number,
        public stock: number,
        public id = crypto.randomUUID()
    ){}
}