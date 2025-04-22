import { MikroORM } from '@mikro-orm/core';
import { MongoHighlighter } from '@mikro-orm/mongo-highlighter';
import dotenv from 'dotenv';

dotenv.config();
console.log(process.env)

const DB = process.env.DB || 'mongodb';
const DB_USER = process.env.DB_USER || '';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = process.env.DB_PORT || '27017';

export const orm = await MikroORM.init({
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  dbName: 'tpbackend',
  type: 'mongo',
  clientUrl: `${DB}://${DB_USER && DB_PASSWORD ? `${DB_USER}:${DB_PASSWORD}@` : ''}${DB_HOST}:${DB_PORT}`,
  highlighter: new MongoHighlighter(),
  debug: true,
  schemaGenerator: {
    //never in production
    disableForeignKeys: true,
    createForeignKeyConstraints: true,
    ignoreSchema: [],
  },
});
