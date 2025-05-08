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
  
  vi.mock('bcrypt', () => {
    return {
      default: {
        compare: vi.fn((password, hash) => {
          console.log(' MOCK bcrypt.compare llamado con:', { password, hash });
          return Promise.resolve(true);
        })
      }
    };
  });
  
  

  vi.mock('jsonwebtoken', async () => {
    return {
      sign: vi.fn(() => 'fake.jwt.token'),
      verify: vi.fn(), 
      default: {
        sign: vi.fn(() => 'fake.jwt.token'),
        verify: vi.fn(),
      },
    };
  });


import app from '../src/appprueba.js'


describe('POST /login', () => {
  it('debería loguear al usuario correctamente', async () => {
    const response = await request(app)
      .post('/login')
      .send({ mail: 'usuario@example.com', password: '123456' })
      .expect(200)

    expect(response.body.result).toBe(true)
    expect(response.body.message).toBe('Usuario logueado')
    expect(response.headers['set-cookie']).toBeDefined()

    const token = response.headers['set-cookie'][0]
    expect(token).toMatch(/access_token/)
  },10000)

  
})
