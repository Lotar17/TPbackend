# Para probar los CRUD debe inicializarse la base de datos

## IMPORTANTE: Crear la variable de entorno

En la raíz del proyecto se debe crear un archivo llamado `.env` que debe tener las siguientes propiedades:

```
DB='mongodb'
DB_USER='<insertar-usuario-de-la-base-de-datos>'
DB_PASSWORD='<insertar-contraseña-de-la-base-de-datos>'
DB_HOST='<insertar-host>(generalmente es 127.0.0.1)'
DB_PORT='<insertar-puerto>'
```

Ya que siempre la connection string debe cumplir con el siguiente formato `${DB}://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}`

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
