const mongoose = require("mongoose")

const DB = process.env.DATABASE;

mongoose.connect(DB)
    .then((connected) => {
        if (connected) {
            console.log("DataBase Connected");
        } else {
            console.error("Problem While Connecting");
        }
    }).catch((err) => {
        console.error(err, "Somthing went wrong");
    });