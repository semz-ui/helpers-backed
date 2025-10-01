"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const userSChema = new mongoose_1.Schema({
    full_name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    occupation: {
        type: String,
        default: "",
    },
    years_of_experience: {
        type: Number,
        default: 0,
    },
    password: {
        type: String,
        required: true,
    }
}, {
    timestamps: true,
});
exports.User = (0, mongoose_1.model)("User", userSChema);
