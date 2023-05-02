const User = require("../Models/userModel")
const jwt = require("jsonwebtoken");

//Verifying token for comparing user is real or intruder
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.token;
    //bearer 
    if (authHeader) {
        const token = authHeader.replace("Bearer ", "");
        jwt.verify(token, process.env.JWT_SECRET, (error, payload) => {
            if (error) {
                return res.status(403).json({ error: "Token is not valid" })
            }
            const { id } = payload;
            User.findById(id).then((userInDb) => {
                req.user = userInDb;
                next();
            }).catch((err) => {
                console.log({ err: "Relogin please" });
                return res.status(401).json({ message: "Unaccesseble OR You are no longer USER please Register" })
            })
        })
    } else {
        return res.status(401).json({ message: "Not Authorised Trespassing prohibited" });
    }

};

// //User Authentication Middleware on Updation Condition
// const verifyTokenAndAuthorization = (req, res, next) => {
//     verifyToken(req, res, () => {
//         if (req.user.id || req.user.isAdmin) {
//             next()
//         } else {
//             return res.status(403).json("Trespassing prohibited user")
//         }
//     })
// };

// //Admin Accessibillity varyfication for Dashboard Menipulation  
// const verifyTokenAndAdmin = (req, res, next) => {
//     verifyToken(req, res, () => {
//         if (req.user.isAdmin) {
//             next()
//         } else {
//             return res.status(403).json("Trespassing prohibited for Admin Panal")
//         }
//     })
// }
module.exports = { verifyToken }