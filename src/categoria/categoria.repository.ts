import { ObjectId } from 'mongodb';
import { db } from '../shared/db/conn.js';
import { Repository } from '../shared/repository.js';
import { Categoria } from './categoria.entity.js';

const categorias = db.collection<Categoria>('categorias');

export class CategoriaRepository implements Repository<Categoria> {
  public async getAll(): Promise<Categoria[] | undefined> {
    return await categorias.find().toArray();
  }

  public async getOne(item: { id: string }): Promise<Categoria | undefined> {
    const _id = new ObjectId(item.id);
    return (await categorias.findOne({ _id })) || undefined;
  }

  public async add(
    id: string,
    item: Categoria
  ): Promise<Categoria | undefined> {
    item._id = (await categorias.insertOne(item)).insertedId;
    return item;
  }

  public async delete(item: { id: string }): Promise<Categoria | undefined> {
    const _id = new ObjectId(item.id);
    return (await categorias.findOneAndDelete({ _id })) || undefined;
  }

  public async update(
    id: string,
    item: Categoria
  ): Promise<Categoria | undefined> {
    const _id = new ObjectId(id);
    return (
      (await categorias.findOneAndUpdate(
        { _id },
        { $set: item },
        { returnDocument: 'after' }
      )) || undefined
    );
  }
}
