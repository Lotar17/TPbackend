import nodemailer from 'nodemailer';
import { Request,Response,NextFunction } from 'express';
import { ValidationError } from '../Errores/validationErrors.js';

 function sanitizeCorreoInput(req: Request, res: Response, next: NextFunction) {
    req.body.sanitizedInput = {
        origen: req.body.origen,
      destinatario: req.body.destinatario,
      asunto: req.body.asunto,
      mensaje: req.body.mensaje,
    };

    Object.keys(req.body.sanitizedInput).forEach((key) => {
      if (req.body.sanitizedInput[key] === undefined) {
        delete req.body.sanitizedInput[key];
      }
    });
  
    next();
  }
  const transporter = nodemailer.createTransport({
   service:"gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  

   async function enviarCorreo(req: Request, res: Response) {//Validado
  try{
    const {origen,destinatario,asunto,mensaje} = req.body.sanitizedInput;
  
    
    if (!origen) {
      throw new ValidationError('No se encontro origen')
    }

    if (!destinatario) {
      throw new ValidationError('No se encontro destinatario')
    }
    if (!asunto) {
      throw new ValidationError('No se encontro asunto')
    }
    if (!mensaje) {
      throw new ValidationError('No se encontro mensaje')
    }
    // Configura las opciones del correo
    const mailOptions = {
      from: origen,
      to: destinatario,
      subject: asunto,
      text: mensaje,
    };
  
    
      await transporter.sendMail(mailOptions);
      return res.status(200).json({ message: 'Correo enviado con éxito' });
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ message: error.message });
      }
  
      console.error('Error al enviar correo:', error);
      return res.status(500).json({ message: 'Error al enviar el correo' });
    }
}
export{ sanitizeCorreoInput,enviarCorreo}