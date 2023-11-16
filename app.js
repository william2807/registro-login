// Importar los módulos necesarios
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./public/user');

// Crear una instancia de la aplicación Express
const app = express();

// Importar el módulo de bcrypt para el cifrado de contraseñas
const bcrypt = require('bcrypt');

// Configurar middleware para procesar datos JSON y URL-encoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Servir archivos estáticos desde el directorio 'public'
app.use(express.static(path.join(__dirname, 'public')));

// URL de conexión a MongoDB
const mongo_url = 'mongodb://localhost:27017/Usuarios';

// Conectar a la base de datos MongoDB
mongoose.connect(mongo_url)
  .then(() => {
    console.log(`Conectado a la base de datos en ${mongo_url}`);
  })
  .catch((err) => {
    console.error('Error conectando a MongoDB:', err);
  });

// Ruta para registrar un nuevo usuario
app.post('/registro', (req, res) => {
  const { username, password } = req.body;

  // Crear una nueva instancia del modelo de usuario
  const newUser = new User({ username, password });

  // Guardar el nuevo usuario en la base de datos
  newUser.save()
    .then(() => {
      res.status(200).send('Usuario registrado');
    })
    .catch(err => {
      res.status(500).send('Error al registrar el usuario');
    });
});

// Ruta para autenticar a un usuario existente
app.post('/autenticable', (req, res) => {
    const { username, password } = req.body;
  
    // Buscar un usuario por su nombre de usuario
    User.findOne({ username })
      .then(foundUser => {
        if (!foundUser) {
          res.status(500).send('El usuario no existe');
        } else {
          // Verificar la contraseña del usuario encontrado
          foundUser.isCorrectPassword(password, (err, result) => {
            if (err) {
              res.status(500).send('Error al autenticar el usuario');
            } else if (result) {
              res.status(200).send('Usuario autenticado correctamente');
            } else {
              res.status(500).send('Usuario y/o contraseña incorrecta');
            }
          });
        }
      })
      .catch(err => {
        res.status(500).send('Error al autenticar el usuario');
      });
  });

// En caso de que se requiera obtener algo, se modifica e implementa el metodo 
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Iniciar el servidor en el puerto 3000
app.listen(3000, () => {
  console.log('Servidor iniciado en el puerto 3000');
});

// Exportar la aplicación para realizar pruebas
module.exports = app;