"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mailer_controller_1 = __importDefault(require("../controllers/mailer.controller"));
const router = (0, express_1.Router)();
const { genrateMail } = new mailer_controller_1.default();
router.post("/generate-mail", genrateMail);
module.exports = router;
