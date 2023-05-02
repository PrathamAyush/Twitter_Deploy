const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const UserSchema = new mongoose.Schema({
    fullname: {
        type: String,
        require: true
    },
    image: {
        type: String,
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true,
    },
    username: {
        type: String,
        require: true,
        unique: true,
    },
    followers: {
        type: Array,
        default: [],
    },
    following: {
        type: Array,
        default: [],
    },
    location: {
        type: String,
        default: "",
    },
    dateOfBirth: {
        type: Date,
        default: "",
    },
    description: {
        type: String,
        default: "",
    },
    tweets: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tweet'
    }],
}, { timestamps: true });


module.exports = mongoose.model("User", UserSchema);