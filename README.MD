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
