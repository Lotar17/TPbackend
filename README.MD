# Para probar los CRUD debe inicializarse la base de datos

## En Windows

```bash
docker run --name mongodb-dsw -v C:\:/data/db -p 27017:27017 -d percona/percona-server-mongodb:latest
```

Este comando crea el volumen en la raíz del disco C:

## En Linux

```bash
docker run --name mongodb-dsw -v /home:/data/db -p 27017:27017 -d percona/percona-server-mongodb:latest
```
Este comando crea el volumen en /home

# Si no conecta a la base de datos se debe cambiar la connection string de conn.ts a la siguiente sin contraseña
```javascript
const connectionStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/';
```
Ya que siempre la connection string debe cumplir con el siguiente formato `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource={admindb}`


