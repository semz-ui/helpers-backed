"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoverLetter = void 0;
const mongoose_1 = require("mongoose");
const coverLetterSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Types.ObjectId,
        ref: "User",
        required: [true, "Please add a user"],
    },
    title: {
        type: String,
        default: "",
    },
    description: {
        type: String,
        default: "",
    },
}, {
    timestamps: true,
});
exports.CoverLetter = (0, mongoose_1.model)("CoverLetter", coverLetterSchema);
