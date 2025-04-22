import { Entity,OneToMany,Property,Rel,OneToOne,ManyToOne} from "@mikro-orm/core";
import { BaseEntity } from "../shared/base-entity.entity.js";
import { EstadoSeguimiento } from "../estado_seguimiento/estado_seguimiento.entity.js";
import { Cascade } from "@mikro-orm/core";
import { Collection } from "@mikro-orm/core";

import { Persona } from "../persona/persona.entity.js";
import { Item } from "../item/item.entity.js";
@Entity()
export class Seguimiento extends BaseEntity{
    @Property({ nullable: true })
    codigoSeguimiento!: number;

    @Property({ nullable: true })
    calificacionServicio?: number;

     
@OneToMany(() => EstadoSeguimiento, (estado) => estado.seguimiento, {
        cascade: [Cascade.ALL],
      })
      estados = new Collection<EstadoSeguimiento>(this);

 @OneToOne(() => Item, { nullable: true })
  item?: Rel<Item>;
  
@ManyToOne(()=>Persona,{nullable:true})
cliente?: Rel<Persona>

}