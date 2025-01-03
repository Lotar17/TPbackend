import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/orm.js';
import { Persona } from '../persona/persona.entity.js';
import { ValidationError } from './registerErrors.js';
import bcrypt from 'bcrypt';

const em = orm.em;

function sanitizeRegisterInput(req:Request,res:Response,next:NextFunction){
    req.body.sanitizedInput = {
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        telefono: req.body.telefono,
        mail: req.body.mail,
        password: bcrypt.hashSync(req.body.password, 10),
        rol: req.body.rol,
    };
    Object.keys(req.body.sanitizedInput).forEach((key) => {
        if (req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key];
        }
    });
    
    next();
}
async function registerUser(req: Request, res: Response) {
    console.log('Datos recibidos:', req.body.sanitizedInput); // Para ver los datos recibidos
    const { nombre,apellido,mail, telefono, password,rol } = req.body.sanitizedInput;
    
    try {
        const user = await em.findOne(Persona, { mail: mail });
        if (user) throw new ValidationError('El mail ya se encuentra en uso');
        const newUser = em.create(Persona, { nombre, apellido, password, mail, telefono,rol});
        console.log('Nueva persona a crear:', newUser);
        await em.persistAndFlush(newUser);
        res.status(201).send({ message: 'Registro exitoso', result: true });
    } catch (error) {
        console.error('Error en registro:', error); // Para ver el error
        if (error instanceof ValidationError)
            res.status(401).send({ message: error.message, result: false });
        else
            res.status(500).send({ message: 'Error interno del servidor', result: false });
    }
}


export { sanitizeRegisterInput, registerUser };