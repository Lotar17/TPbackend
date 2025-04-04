import { Entity,OneToMany,Property,Rel,OneToOne} from "@mikro-orm/core";
import { BaseEntity } from "../shared/base-entity.entity.js";
import { EstadoSeguimiento } from "../estado_seguimiento/estado_seguimiento.entity.js";
import { Cascade } from "@mikro-orm/core";
import { Collection } from "@mikro-orm/core";
import { Compra } from "../compra/compra.entity.js";
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

 @OneToOne(() => Compra, { nullable: true })
  compra?: Rel<Compra>;

}