import { Entity,ManyToOne,Property,Rel } from "@mikro-orm/core";
import { BaseEntity } from "../shared/base-entity.entity.js";
import { Empleado } from "../empleado/empleado.entity.js";
import { Seguimiento } from "../seguimiento/seguimiento.entity.js";
import { Localidad } from "../localidad/localidad.entity.js";
import { Persona } from "../persona/persona.entity.js";

@Entity()
export class EstadoSeguimiento extends BaseEntity {
  @Property({ nullable: false })
  condicion!: string;
   // pendiente-- Realizado
  @Property({ nullable: false })
  estado?: string; // En clasificacion - Listo para reparto- En Camino- Entregado

  @Property({ nullable: false })
  fecha!: string;

  
 @ManyToOne(() => Persona, { nullable: true })
  empleado?: Rel<Persona>;

@ManyToOne(()=>Seguimiento,{nullable:true})
seguimiento?:Rel<Seguimiento>

@ManyToOne(()=>Localidad,{nullable:true})
localidad?:Rel<Localidad>
   

}