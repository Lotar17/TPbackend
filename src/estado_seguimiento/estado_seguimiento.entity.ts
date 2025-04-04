import { Entity,ManyToOne,Property,Rel } from "@mikro-orm/core";
import { BaseEntity } from "../shared/base-entity.entity.js";
import { Empleado } from "../empleado/empleado.entity.js";
import { Seguimiento } from "../seguimiento/seguimiento.entity.js";
import { Localidad } from "../localidad/localidad.entity.js";
@Entity()
export class EstadoSeguimiento extends BaseEntity {
  @Property({ nullable: false })
  estado!: string;

  @Property({ nullable: false })
  fecha!: string;

  
 @ManyToOne(() => Empleado, { nullable: true })
  empleado?: Rel<Empleado>;

@ManyToOne(()=>Seguimiento,{nullable:true})
seguimiento?:Rel<Seguimiento>

@ManyToOne(()=>Localidad,{nullable:true})
localidad?:Rel<Localidad>
   

}