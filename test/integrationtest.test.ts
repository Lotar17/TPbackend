// Test de integración limpio sin mock redundante
import request from 'supertest'
import { describe, it, expect, vi } from 'vitest'

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// Mocks
vi.mock('../src/shared/db/orm.js', async () => {
    const { em } = await import('../test/mocks/mock-em.js');
  
    return {
      orm: {
        em: {
          fork: () => em // devolvemos el mock em
        }
      }
    };
  });
  
vi.mock('bcrypt', () => ({
    compare: vi.fn(() => true)
}))

vi.mock('jsonwebtoken', () => ({
    sign: vi.fn(() => 'token')
}))


import app from '../src/appprueba.js'


describe('POST /login', () => {
  it('debería loguear al usuario correctamente', async () => {
    const response = await request(app)
      .post('/login')
      .send({ sanitizedInput: { mail: 'usuario@example.com', password: '123456' } })
      .expect(200)

    expect(response.body.result).toBe(true)
    expect(response.body.message).toBe('Usuario logueado')
    expect(response.headers['set-cookie']).toBeDefined()

    const token = response.headers['set-cookie'][0]
    expect(token).toMatch(/access_token/)
  })

  it('debería fallar si el usuario no existe', async () => {
    const response = await request(app)
      .post('/login')
      .send({ sanitizedInput: { mail: 'noexiste@example.com', password: '123456' } })
      .expect(401)

    expect(response.body.result).toBe(false)
    expect(response.body.message).toMatch(/incorrecto/)
  })

  it('debería fallar si la contraseña es incorrecta', async () => {
    const response = await request(app)
      .post('/login')
      .send({ sanitizedInput: { mail: 'juan@example.com', password: 'wrong' } })
      .expect(401)

    expect(response.body.result).toBe(false)
    expect(response.body.message).toMatch(/incorrecto/)
  })
})
