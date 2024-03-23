const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        uppercase: true,
        required: true,
        unique: true,
    },
    status: {
        type: String,
        default: "Active"
    }
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
