import nodemailer from 'nodemailer';
import { Request,Response,NextFunction } from 'express';
import { orm } from '../shared/db/orm';
import { error } from 'console';
import exp from 'constants';

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

  

   async function enviarCorreo(req: Request, res: Response) {
  try{
    const {origen,destinatario,asunto,mensaje} = req.body.sanitizedInput;
  
    // Valida los datos
    if (!origen||!destinatario || !asunto || !mensaje) {
        return res.status(404).json({ message: 'El correo no se envio' });
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
      console.error('Error al enviar correo:', error);
      return res.status(500).json({ message: 'Error al enviar el correo' });
    }
}
export{ sanitizeCorreoInput,enviarCorreo}