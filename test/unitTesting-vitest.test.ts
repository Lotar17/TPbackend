import { isperiodoDevolucion, isCompraConcretada, isCantidadDevueltaValida } from "./Unitetest.js"
import { describe, it, expect } from 'vitest'

const devolucionValida = {
    cantidad_devuelta: 2,
    item: {
    cantidad_producto: 5,
    compra: {
        fecha_hora_compra: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // hace 10 días
    },
    seguimiento: {
        estados: [
          { id: 1, nombre: 'estado1' },
          { id: 2, nombre: 'estado2' },
          { id: 3, nombre: 'estado3' },
          { id: 4, nombre: 'estado4' },
        ]
      },
    },
  }
  
  const devolucionInvalida = {
    cantidad_devuelta: 10,
    item: {
      cantidad_producto: 3,
      compra: {
        fecha_hora_compra: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(), // hace 40 días
      },
      seguimiento: {
        estados: [
          { id: 1, nombre: 'estado1' },
          { id: 2, nombre: 'estado2' },
        ]
      },
    },
  }
  
  const devolucionInvalidaCantidadDevueltaNegativa = {
    cantidad_devuelta: -3,
    item: {
      cantidad_producto: 3,
      compra: {
        fecha_hora_compra: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(), // hace 40 días
      },
      seguimiento: {
        estados: [
          { id: 1, nombre: 'estado1' },
          { id: 2, nombre: 'estado2' },
        ]
      },
    },
  }
  
  describe('Unit test de periodoDevolucion()', () => {
    it('debería retornar true si la compra es dentro de los 30 días', () => {
      const result = isperiodoDevolucion(devolucionValida)
      expect(result).toEqual(true)
    })
  
    it('debería retornar false si la compra es mayor a 30 días', () => {
      const result = isperiodoDevolucion(devolucionInvalida)
      expect(result).toEqual(false)
    })
  })
  
  describe('Unit test de CompraConcretada()', () => {
    it('debería retornar true si hay 4 estados', () => {
      const result = isCompraConcretada(devolucionValida)
      expect(result).toEqual(true)
    })
  
    it('debería retornar false si hay menos de 4 estados', () => {
      const result = isCompraConcretada(devolucionInvalida)
      expect(result).toEqual(false)
    })
  })
  
  describe('Unit test de isCantidadDevueltaValida()', () => {
    it('debería retornar true si la cantidad devuelta es válida', () => {
      const result = isCantidadDevueltaValida(devolucionValida)
      expect(result).toEqual(true)
    })
  
    it('debería retornar false si la cantidad devuelta es mayor a la cantidad dentro del item', () => {
      const result = isCantidadDevueltaValida(devolucionInvalida)
      expect(result).toEqual(false)
    })
  
    it('debería retornar false si la cantidad devuelta es negativa', () => {
      const result = isCantidadDevueltaValida(devolucionInvalidaCantidadDevueltaNegativa)
      expect(result).toEqual(false)
    })
  })
  