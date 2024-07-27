import { ObjectId } from 'mongodb';
import { db } from '../shared/db/conn.js';
import { Repository } from '../shared/repository.js';
import { Producto } from './producto.entity.js';

const productos = db.collection<Producto>('productos');

export class ProductoRepository implements Repository<Producto> {
  public async getAll(): Promise<Producto[] | undefined> {
    return productos.find().toArray();
  }
  public async getOne(item: { id: string }): Promise<Producto | undefined> {
    const id = new ObjectId(item.id);
    return (await productos.findOne({ id })) || undefined;
  }
  public async add(id: string, item: Producto): Promise<Producto | undefined> {
    item._id = (await productos.insertOne(item)).insertedId;
    return item;
  }
  public async update(
    id: string,
    item: Producto
  ): Promise<Producto | undefined> {
    /* const _idd = new ObjectId(id); */
    return (
      (await productos.findOneAndUpdate(
        { id },
        { $set: item },
        { returnDocument: 'after' }
      )) || undefined
    );
  }
  public async delete(item: { id: string }): Promise<Producto | undefined> {
    const _idd = new ObjectId(item.id);
    return (await productos.findOneAndDelete({ _idd })) || undefined;
  }
}
