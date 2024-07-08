import { Repository } from '../shared/repository.js';
import { Persona } from './persona.entity.js';
import { db } from '../shared/db/conn.js';
import { ObjectId, ReturnDocument } from 'mongodb';

const personas = db.collection<Persona>('personas')

export class PersonaRepository implements Repository<Persona> {

  async getAll(): Promise <Persona[] | undefined> {
    return await personas.find().toArray();
  }

  async getOne(item: { id: string }): Promise <Persona | undefined> {
    const _id = new ObjectId(item.id)
    return (await personas.findOne({_id})) || undefined
  }

  async add(id:string,item: Persona): Promise <Persona | undefined> {
    const _id = new ObjectId(id)
    const personaExistente = await personas.findOne({_id});
    if (personaExistente) {
      return undefined;
    } else {
      item._id = (await personas.insertOne(item)).insertedId;
      return item;
    }
  }

  async update(id:string,item: Persona): Promise <Persona | undefined> {
    const _id = new ObjectId(id)
    return (await personas.findOneAndUpdate({_id},{$set: item}, {returnDocument:'after'})) || undefined
    
  }

  async delete(item: { id: string }): Promise<Persona | undefined> {
    const _id = new ObjectId(item.id)
    return ( await personas.findOneAndDelete({_id})) || undefined
  }
  
}
