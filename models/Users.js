const mongoose = require("mongoose");

/**
 * The JSON object Schema for defining the structurre and contents of the 
 * user database object
 */
const userSchema = mongoose.Schema({
    username: { type: String, require: true, min: 3, max: 256 },
    email: { type: String, require: true, min: 6, max: 256 },
    password: { type: String, require: true, min: 6, max: 1024 },
    date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("users", userSchema);
