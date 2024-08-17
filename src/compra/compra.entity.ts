import {
    Entity,
    Property,
    Cascade,
    ManyToOne,
    Rel,
  } from '@mikro-orm/core'
import { BaseEntity } from '../shared/base-entity.entity.js'
import { Producto } from '../producto/producto.entity.js'
import { Persona } from '../persona/persona.entity.js'
 import { Empleado } from '../empleado/empleado.entity.js'

@Entity()
export class Compra extends BaseEntity {
    @Property({ nullable: false })
    direccion_entrega!: string

    @ManyToOne(() => Producto, { nullable: false })
    producto!: Rel<Producto>

    @ManyToOne(() => Persona, { nullable: false })
    persona!: Rel<Persona>

    
    @ManyToOne(() => Empleado, { nullable: false })
   empleado!: Rel<Empleado>

    @Property({ nullable: false })
    cantidad_producto!: number

    @Property({ nullable: false })
  fecha_hora_compra!: number

  @Property({ nullable: false })
  descuento!: number


}