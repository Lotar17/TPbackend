import { MongoClient,Db} from "mongodb";

const connectionStr = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/' ;
const connectionStrEmpleado = process.env.MONGO_URI_EMPLEADO || 'mongodb://127.0.0.1:27017/';

const cli = new MongoClient(connectionStr);
const cliEmpleado = new MongoClient(connectionStrEmpleado);

await cli.connect();

export let db:Db = cli.db('tpbackend');

await cliEmpleado.connect();
export let dbEmpleado: Db = cliEmpleado.db('empleados');