"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = require("../model/user.model");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_validation_1 = require("../validation/user.validation");
class Auth {
    constructor() {
        this.createUser = (0, express_async_handler_1.default)(async (req, res) => {
            const { error, value } = user_validation_1.userRegisterValidationSchema.validate(req.body);
            if (error) {
                res.status(400).json({
                    errors: error.details[0].message
                });
                return;
            }
            const { full_name, email, occupation, years_of_experience, password } = req.body;
            const userExists = await user_model_1.User.findOne({ email });
            if (userExists) {
                res.status(400);
                throw new Error("Email already exists please login or use a different email");
            }
            const salt = await bcrypt_1.default.genSalt(10);
            const hashedPassword = await bcrypt_1.default.hash(password, salt);
            const createdUser = await user_model_1.User.create({
                full_name,
                email,
                occupation,
                years_of_experience,
                password: hashedPassword,
            });
            if (!createdUser) {
                res.status(400);
                throw new Error("Invalid user data");
            }
            // Generate JWT token
            const token = generateToken(createdUser._id.toString());
            const { password: _, ...returnedUser } = createdUser.toObject();
            res.status(201).json({ ...returnedUser, token });
        });
        this.loginUser = (0, express_async_handler_1.default)(async (req, res) => {
            const { error, value } = user_validation_1.userLoginValidationSchema.validate(req.body);
            console.log(value, error, req.body);
            if (error) {
                // Joi gives you structured error details
                res.status(400).json({
                    errors: error.details.map(d => d.message)
                });
                return;
            }
            const { email, password } = req.body;
            const user = await user_model_1.User.findOne({ email });
            if (user && (await bcrypt_1.default.compare(password, user.password))) {
                // Generate JWT token
                const token = generateToken(user._id.toString());
                const returnedUser = user.populate("User", "-password");
                res.status(200).json({ ...returnedUser, token });
            }
            else {
                res.status(401);
                throw new Error("Invalid email or password");
            }
        });
    }
}
exports.default = Auth;
const generateToken = (id) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }
    const options = {
        expiresIn: (process.env.JWT_EXPIRES_IN || "7d"),
    };
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, options);
};
