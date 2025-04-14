import { EstadoSeguimiento } from "./estado_seguimiento.entity.js";
import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/orm.js';
import { Persona } from "../persona/persona.entity.js";
import { Localidad } from "../localidad/localidad.entity.js";
import { populate } from "dotenv";
import { Seguimiento } from "../seguimiento/seguimiento.entity.js";
import { escape } from "querystring";
const em = orm.em;

function sanitizeEstadoSeguimientoInput(req: Request, res: Response, next: NextFunction) {
    req.body.sanitizedInput = {
      condicion:req.body.condicion,
      estado: req.body.estado,
      fecha:req.body.fecha,
      localidad: req.body.localidad,
      empleado: req.body.empleado,
      seguimiento:req.body.seguimiento
      
      
    };
  
    Object.keys(req.body.sanitizedInput).forEach((key) => {
      if (req.body.sanitizedInput[key] === undefined) {
        delete req.body.sanitizedInput[key];
      }
    });
  
    next();
  }
  
  async function add(req: Request, res: Response) {
    try {
      const empleado=req.body.sanitizedInput.empleado
      const id_seguimiento=req.body.sanitizedInput.seguimiento
let localidad      
let estado
      const seguimiento= await em.findOne(Seguimiento,{id:id_seguimiento},{populate:['estados','item.producto.persona.direccion.localidad']})

      if(seguimiento?.estados.length===0){
 estado= 'En Clasificacion'
 localidad=seguimiento.item?.producto.persona.direccion?.localidad?.id
 }

 else if(seguimiento?.estados.length===1){
  estado= 'En centro de distribución'
  localidad=req.body.sanitizedInput.localidad
 }

 else if(seguimiento?.estados.length===2){
   estado='En camino'
   localidad=req.body.sanitizedInput.localidad
 }
 else {
   estado= 'Cerrado'
   localidad=req.body.sanitizedInput.localidad
 }
const fecha= new Date().toString()

 const estadoNuevo= em.create(EstadoSeguimiento,{
condicion:'Pendiente',
estado:estado,
fecha:fecha,
empleado:empleado,
seguimiento:id_seguimiento,
localidad:localidad
 })
 await em.persistAndFlush(estadoNuevo);
 return res.status(200).json({ message: 'Estado seguimiento add successfully', data: estadoNuevo });
 }
    catch (error: any) {
      return res.status(500).json({ message: 'Failed to add new Estado seguimiento' });
    }
  
  }



  async function searchEmployee(req: Request, res: Response) {
    try {
      const idLocalidad = req.params.idLocalidad;
  
      // Paso 1: Traigo todos los empleados con localidad y estados_empleados cargados
      const empleados = await em.find(Persona, {
        rol: 'Empleado'
      }, { populate: ['direccion.localidad', 'estados_empleados'] });
  
      // Paso 2: Filtro empleados por localidad
      const empleadosFiltrados = empleados.filter(e =>
        e.direccion?.localidad?.id === idLocalidad
      );
  
      // Paso 3: Calcular fecha hace 7 días
      const ahora = new Date();
      const sieteDiasAtras = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
  
      
      const empleadosConCantidad = empleadosFiltrados.map(empleado => {
        const cantidad = empleado.estados_empleados.getItems().filter(estado =>
          new Date(estado.fecha) >= sieteDiasAtras

        ).length;
  
        return {
          empleado,
          cantidad
        };
      });
  
      // Paso 5: Ordeno por menor cantidad y tomo el primero
      empleadosConCantidad.sort((a, b) => a.cantidad - b.cantidad);
  
      const empleadoSeleccionado = empleadosConCantidad[0]?.empleado;
  
      return res.status(200).json({
        message: 'Empleado seleccionado con éxito',
        data: empleadoSeleccionado || null
      });
  
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ message: 'Fallo la búsqueda de empleados' });
    }
  }
  async function getStatebyEmployee(req:Request, res:Response){
try{
  const empleadoId= req.params.idEmpleado
const estadosEmpleado= await em.find(EstadoSeguimiento,{empleado:empleadoId},{populate:['empleado','seguimiento']})

if (estadosEmpleado.length!==0){
  
  return res.status(200).json({
    message: 'Empleado seleccionado con éxito',
    data: estadosEmpleado || null
  });
}

  
}
catch (error: any) {
  console.error(error);
  return res.status(500).json({ message: 'Fallo la búsqueda de estados' });
}

  }
  async function update(req:Request, res:Response){
try{
const idEstado=req.params.id
const estadoToUpdate= await em.findOne(EstadoSeguimiento,{id:idEstado})
if(estadoToUpdate)
em.assign(estadoToUpdate,req.body.sanitizedInput)
await em.flush()
return res
      .status(200)
      .json({
        message: 'Estado updated succesfully !',
        data: estadoToUpdate,
      });

}
catch(error){
  return res.status(500).json({ message: 'error' });
}



  }

  export {sanitizeEstadoSeguimientoInput,add,searchEmployee,getStatebyEmployee,update}