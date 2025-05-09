
type EstadoSeguimiento = {
    id: number;
    nombre: string;
  };


type PartialDevolucion = { // devolucion creada para testing unitario
    item: {
      cantidad_producto: number;
      seguimiento: {
        estados: EstadoSeguimiento[]; 
      };
      compra: {
        fecha_hora_compra: string;
      };
    };
    cantidad_devuelta: number;
  };


   function isperiodoDevolucion(devolucion: PartialDevolucion): boolean {
if(devolucion.item && devolucion.item.compra ){

    const fechaCompra = new Date(devolucion.item.compra.fecha_hora_compra);
    const fechaActual = new Date();
    const diferenciaDias = (fechaActual.getTime() - fechaCompra.getTime()) / (1000 * 60 * 60 * 24);
    if(diferenciaDias<= 30){
        return true
    }
    else
        return false

  }
  else
    return false
  }


   function isCompraConcretada(devolucion: PartialDevolucion): boolean {
    if(devolucion.item && devolucion.item.seguimiento && devolucion.item.seguimiento.estados.length!==0){
        if(  devolucion.item.seguimiento.estados.length === 4){
            return true
        }
            else return false
   }
   else return false
  }


  function isCantidadDevueltaValida(devolucion: PartialDevolucion): boolean {
let cantidad
cantidad=devolucion.cantidad_devuelta

  if  (typeof cantidad !== 'number' || isNaN(cantidad)){
    return false
  }
  if (cantidad > 0 && cantidad <= devolucion.item.cantidad_producto){
    return true
  }
  else return false

  }

  export {
    PartialDevolucion,
    isperiodoDevolucion,
    isCompraConcretada,
    isCantidadDevueltaValida
  }