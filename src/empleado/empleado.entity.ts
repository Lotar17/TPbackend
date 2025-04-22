import {
  Entity,
  Property,
  Cascade,
  OneToMany,
  Rel,
  Collection
} from '@mikro-orm/core'
import { BaseEntity } from '../shared/base-entity.entity.js'
import { Compra } from '../compra/compra.entity.js'
import { EstadoSeguimiento } from '../estado_seguimiento/estado_seguimiento.entity.js'
@Entity()
export class Empleado extends BaseEntity {
  @Property({ nullable: false })
 nombre!: string

 @Property({ nullable: false })
 apellido!: string

 @Property({ nullable: false })
 telefono!: string
 
 @Property({ nullable: false })
 email!: string



}