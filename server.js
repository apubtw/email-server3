const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); 
  }
});

const upload = multer({ storage: storage });

app.use(cors());


app.post('/send-email', upload.single('archivoZip'), async (req, res) => {
  const { nombreCompleto, correoUC, descripcionProyecto } = req.body;
  const archivoZip = req.file;

  if (!archivoZip) {
    return res.status(400).send('No se adjuntó ningún archivo ZIP');
  }


  let transporter = nodemailer.createTransport({
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false,
    auth: {
      user: 'rfuentealbd@uc.cl',
      pass: 'Apuraiders1.2'
    }
  });

let mailOptions = {
    from: 'rfuentealbd@uc.cl',
    to: `${correoUC}, rfuentealbd@uc.cl`,
    subject: 'Solicitud de Rendición de cuentas',
    text: `Estimado/a,
    
    Se informa que el día de ${new Date().toLocaleDateString()}, el profesor ${nombreCompleto} realizó una solicitud de rendición de cuentas para el proyecto ${descripcionProyecto}. A continuación, los archivos enviados por el profesor.
    
    Esto es un mensaje automático.`,
    attachments: [
      {
        filename: archivoZip.originalname,
        path: archivoZip.path
      }
    ]
  };
  

  try {
    await transporter.sendMail(mailOptions);
    fs.unlinkSync(archivoZip.path);
    res.status(200).send('Correo enviado exitosamente');
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    res.status(500).send('Error al enviar el correo');
  }
});

app.listen(port, () => {
  console.log(`Servidor de correo ejecutándose en http://localhost:${port}`);
});
