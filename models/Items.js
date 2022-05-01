const mongoose = require("mongoose");

/**
 * The JSON object Schema for defining the structurre and contents of the 
 * items database object
 */
const ItemsSchema = mongoose.Schema({
    ItemTitle: { type: String, required: true },
    ItemRegTimeStamp: { type: Date, default: Date.now },
    isItemConditionNew: { type: Boolean, default: false },
    ItemDesc: { type: String, required: true },
    Endtime: { type: Date, required: true },
    Owner: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    isSold: { type: Boolean, default: false },
});

module.exports = mongoose.model("items", ItemsSchema);
