import {
    Entity,
    Property,
    Cascade,
    ManyToOne,
    Rel,
    Collection,
    OneToMany,
    OneToOne
  } from '@mikro-orm/core'
import { BaseEntity } from '../shared/base-entity.entity.js'
import { Producto } from '../producto/producto.entity.js'
import { Persona } from '../persona/persona.entity.js'
 import { Empleado } from '../empleado/empleado.entity.js'
import { Item } from '../item/item.entity.js'

import { Direccion } from '../direccion/direccion.entity.js'
import { Localidad } from '../localidad/localidad.entity.js'
@Entity()
export class Compra extends BaseEntity {
    

    
    @ManyToOne(() => Persona, { nullable: false })
    persona!: Rel<Persona>

      @OneToMany(() => Item, (item) => item.compra, {
        cascade: [Cascade.ALL],
      })
      items = new Collection<Item>(this);
  
    @Property({ nullable: false})
  fecha_hora_compra!: string

  @Property({ nullable: false })
    total_compra!: number

    @Property({ nullable: true })
    estado!: string

     

      @ManyToOne(() => Direccion, { nullable: true })
      direccion?: Rel<Direccion>
    
}