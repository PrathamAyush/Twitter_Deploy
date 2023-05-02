const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path")
require("dotenv").config();

// Module Calling
const auth = require("./Routes/authRoute");
const user = require("./Routes/userRoute");
const tweet = require("./Routes/tweetRoute");

/* Setting the limit of the JSON parser too high as usual to prevent 
the error from serverside as payload is too large in case of sending img file in base64 format */
app.use(express.json({ limit: '5mb' }));
app.use(cors());

// callind DB Connection
require("./dataBase/dbConn")

//API Routes Calling
app.use("/api/auth/", auth); //Singup-signin Route
app.use("/api/user/", user); //user update route
app.use("/api/tweet/", tweet); //user tweet route


// Code For Deployment Live
//configure static page for deployement and deployment
app.use(express.static(path.join(__dirname, "./client/build")))
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "./client/build/index.html"))
})

// test API
app.get("/", (req, res) => {
    res.send("Hellow Twitter")
});

app.listen(3200, () => {
    console.log("Server Started At port", 3200);
})