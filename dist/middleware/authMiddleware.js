"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../model/user.model");
const protect = (0, express_async_handler_1.default)(async (req, res, next) => {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
        try {
            // Get token from header and remove Bearer from string
            token = req.headers.authorization.split(" ")[1];
            // Verify token
            if (!process.env.JWT_SECRET) {
                throw new Error("JWT_SECRET is not defined in environment variables");
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            // Get user from database
            req.user = await user_model_1.User.findById(decoded.id).select("-password");
            next();
        }
        catch (error) {
            console.log(error);
            res.status(401);
            throw new Error("Not authorized to access this route");
        }
    }
    if (!token) {
        res.status(401);
        throw new Error("Not authorized no token");
    }
});
exports.protect = protect;
