import { Repository } from '../shared/repository.js';
import { Empleado } from './empleado.entity.js';
import { dbEmpleado } from '../shared/db/conn.js';
import { ObjectId, ReturnDocument } from 'mongodb';

const empleados = dbEmpleado.collection<Empleado>('empleados')

export class EmpleadoRepository implements Repository<Empleado> {

  async getAll(): Promise <Empleado[] | undefined> {
    return await empleados.find().toArray();
  }

  async getOne(item: { id: string }): Promise <Empleado| undefined> {
    const _id = new ObjectId(item.id)
    return (await empleados.findOne({_id})) || undefined
  }

  async add(id:string,item: Empleado): Promise <Empleado | undefined> {
    const _id = new ObjectId(id)
    const empleadoExistente = await empleados.findOne({_id});
    if (empleadoExistente) {
      return undefined;
    } else {
      item._id = (await empleados.insertOne(item)).insertedId;
      return item;
    }
  }

  async update(id:string,item: Empleado): Promise <Empleado | undefined> {
    const _id = new ObjectId(id)
    return (await empleados.findOneAndUpdate({_id},{$set: item}, {returnDocument:'after'})) || undefined
    
  }

  async delete(item: { id: string }): Promise<Empleado | undefined> {
    const _id = new ObjectId(item.id)
    return ( await empleados.findOneAndDelete({_id})) || undefined
  }
  
}