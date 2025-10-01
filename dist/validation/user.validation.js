"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userLoginValidationSchema = exports.userRegisterValidationSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.userRegisterValidationSchema = joi_1.default.object({
    full_name: joi_1.default.string().min(3).max(50).required(),
    email: joi_1.default.string().email().required(),
    occupation: joi_1.default.string().allow("").optional(),
    years_of_experience: joi_1.default.number().min(0).max(50).optional(),
    password: joi_1.default.string().min(6).required(),
});
exports.userLoginValidationSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).required(),
});
