import { Entity,ManyToOne,Property,Rel } from "@mikro-orm/core";
import { BaseEntity } from "../shared/base-entity.entity.js";
import { Localidad } from "../localidad/localidad.entity.js";


@Entity()
export class Direccion extends BaseEntity{

    @Property({ nullable: true })
    calle!: string;

    @Property({ nullable: true })
    numero!: number;

 
 @ManyToOne(() => Localidad, { nullable: true })
  localidad?: Rel<Localidad>;

}