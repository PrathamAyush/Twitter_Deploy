const express = require("express");
const router = express.Router();
const User = require("../Models/userModel");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");

//SingnUp Route of User
router.post("/signup", (req, res) => {
    const { fullname, username, email, password } = req.body;
    if (!fullname || !username || !email || !password) {
        return res.status(400).json("Fill All Mendetory Field")
    }
    User.findOne({ username: username }).then((userExist) => {
        if (userExist) {
            return res.status(502).json({ message: "User Already Exist" });
        }
        bcrypt.hash(password, 16).then((hashPass) => {
            const newUser = new User({ fullname, username, email, password: hashPass });
            newUser.save().then(() => {
                const { password, ...others } = newUser._doc;
                console.log(others);
                return res.status(201).json(others);
            }).catch((err) => {
                return res.status(500).json(err);
            });
        }).catch((err) => {
            console.log(err);
        });
        return
    });

});

//Login Route of user
router.post("/signin", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(402).json({ message: "Fill All Mendetory Field" });
    }
    User.findOne({ username: username }).then((user) => {
        if (!user) {
            return res.status(402).json({ message: "User Not Found" })
        }
        bcrypt.compare(password, user.password).then((userMatched) => {
            if (userMatched) {
                const token = JWT.sign({ id: user._id }, process.env.JWT_SECRET);

                const userInfo = {
                    "id": user._id,
                    "fullname": user.fullname,
                    "email": user.email,
                    "follower": user.followers,
                    "following": user.following,
                    "description": user.description,
                    "location": user.location,
                    "dateOfBirth": user.dateOfBirth,
                    "image": user.image,
                    "username": user.username
                }
                return res.status(200).json({ result: { user: userInfo, token: token } });
            } else {
                return res.status(401).json({ message: "Invalid Credential" })
            }
        }).catch((err) => {
            console.log(err);
            return res.status(501).json({ message: "Somthing Goes Wrong" });
        })
    })
})

module.exports = router;