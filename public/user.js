// Importación de módulos necesarios
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Número de rondas para el hashing de contraseñas 
const saltRounds = 10;

// Definición del esquema del usuario utilizando Mongoose
const UserSchema = new mongoose.Schema({
    // Campo para el nombre de usuario, obligatorio y único
    username: { type: String, required: true, unique: true },
    
    // Campo para la contraseña, obligatorio
    password: { type: String, required: true }
});

// Middleware que se ejecuta antes de guardar el usuario en la base de datos
UserSchema.pre('save', function (next) {
    // Verifica si es un nuevo usuario o si la contraseña ha sido modificada
    if (this.isNew || this.isModified('password')) {
        // Referencia al documento actual
        const document = this;

        // Utiliza bcrypt para hashear la contraseña
        bcrypt.hash(document.password, saltRounds, (err, hashedPassword) => {
            if (err) {
                // Si hay un error, pasa el error al siguiente middleware
                return next(err);
            }

            // Actualiza la contraseña con la versión hasheada
            document.password = hashedPassword;

            // Continúa con el proceso de guardado
            next();
        });
    } else {
        // Si no es un nuevo usuario ni se modificó la contraseña, continúa con el proceso de guardado
        next();
    }
});

// Método personalizado para verificar la contraseña del usuario
UserSchema.methods.isCorrectPassword = function (password, callback) {
    // Utiliza bcrypt para comparar la contraseña proporcionada con la contraseña almacenada
    bcrypt.compare(password, this.password, function (err, same) {
        if (err) {
            // Si hay un error, pasa el error al callback
            callback(err);
        } else {
            // Llama al callback con el resultado de la comparación
            callback(null, same);
        }
    });
};

module.exports = mongoose.model('User', UserSchema);
