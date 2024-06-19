

const express = require("express");
const router = express.Router();
const UserController = require ("../controllers/user.controller.js");
const passport = require("passport");
const initializePassport = require("../config/passport.config.js");


//const authMiddleware = require("../middleware/authmiddleware.js");
//const Passport = require("../config/passport.js");

//const { route } = require("./carts.router");
const userController = new UserController();






const jwt = require("jsonwebtoken");
const { createHash, isValidPassword } = require("../utils/hashbcrypt.js");

const UserDTO = require("../dto/user.dto.js");


router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile",passport.authenticate("jwt", { session: false }),  userController.profile);
router.post("/logout", userController.logout.bind(userController));
router.get("/admin",passport.authenticate("jwt", { session: false }), userController.admin);
 
//cuarta integradora:

//Modificamos el usuario para que sea premium: 
router.put("/premium/:uid", userController.cambiarRolPremium);

const UserRepository = require("../repositories/user.repository.js");
const userRepository = new UserRepository();

router.post("/:uid/documents", async(req,res) => {

    const { uid } = req.params;
    const uploadedDocuments = req.files;
    
    try {
        const user = await userRepository.findById(uid);

        if (!user) {
            return res.status(404).send("Usuario no encontrado");
        }

        //Ahora vamos a verificar si se suben los documentos y se actualiza el usuario: 

        if (uploadedDocuments) {
            if (uploadedDocuments.document) {
                user.documents = user.documents.concat(uploadedDocuments.document.map(doc => ({
                    name: doc.originalname,
                    reference: doc.path
                })))
            }

            if (uploadedDocuments.products) {
                user.documents = user.documents.concat(uploadedDocuments.products.map(doc => ({
                    name: doc.originalname,
                    reference: doc.path
                })))
            }

            if (uploadedDocuments.profile) {
                user.documents = user.documents.concat(uploadedDocuments.profile.map(doc => ({
                    name: doc.originalname,
                    reference: doc.path
                })))
            }
        }

        //Guardamos los cambios en la base de datos: 

        await user.save();

        res.status(200).send("Documentos cargados exitosamente");
    } catch (error) {
        console.log(error);
        res.status(500).send("Error interno del servidor, los mosquitos seran cada vez mas grandes");
    }

})
  

module.exports = router;