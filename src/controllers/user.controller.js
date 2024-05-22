

const UserModel = require("../models/user.model.js");

const CartModel = require("../models/cart.model.js");

/* const UserRepository = require("../repositories/user.repository.js");
const userRepository = new UserRepository();  */

const jwt = require("jsonwebtoken");
const { createHash, isValidPassword } = require("../utils/hashbcrypt.js");
const UserDTO = require("../dto/user.dto.js");

class UserController {
    
    async register(req, res) {
       const {first_name,last_name,email,password,age} = req.body;

        try {

            const user = await UserModel.findOne({email});
            if(user) return res.status(400).send("usuario ya existe");

            const nuevoCarrito = new CartModel();
            await nuevoCarrito.save();

            const nuevoUsuario = new UserModel({
                first_name,
                last_name,
                email,
                password: createHash(password),
                age,
                cart : nuevoCarrito._id
              })
            await nuevoUsuario.save();
            //res.json(nuevoUsuario);
              
            res.send("usuario registrado correctamente");
        } 
        catch (error) {
            res.status(500).send("error")
        } 
        
             //const nuevoUsuario = await userRepository.RegisterUser({first_name, last_name, email, password, age})
            
        const token = jwt.sign({ user: nuevoUsuario }, "coderhouse", {
                expiresIn: "1h"
            }); 

            res.cookie("coderCookieToken", token, {
                maxAge: 3600000,
                httpOnly: true
            });
 
            res.redirect("/api/users/profile");
    

        
    }

    async login(req, res) {
        const { email, password } = req.body;
        try {
            const usuarioEncontrado = await UserModel.findOne({ email });

            if (!usuarioEncontrado) {
                return res.status(401).send("Usuario no válido");
            } 

       

            const esValido = isValidPassword(password, usuarioEncontrado);
            if (!esValido) {
                return res.status(401).send("Contraseña incorrecta");
            }

            const token = jwt.sign({ user: usuarioEncontrado }, "coderhouse", {
                expiresIn: "1h"
            });

            res.cookie("coderCookieToken", token, {
                maxAge: 3600000,
                httpOnly: true
            });

            res.redirect("/api/users/profile");
        } catch (error) {
            console.error(error);
            res.status(500).send("Error interno del servidor");
        }
    }

    async profile(req, res) {
        //Con DTO: 
        const userDto = new UserDTO(req.first_name, req.last_name, req.role);
        const isAdmin = req.role === 'admin';
        res.render("profile", { user: userDto, isAdmin });
    }

    async logout(req, res) {
        res.clearCookie("coderCookieToken");
        res.redirect("/login");
    }

    async admin(req, res) {
        if (req.role !== "admin") {
            return res.status(403).send("Acceso denegado");
        }
        res.render("admin");
    }
}

module.exports = UserController;