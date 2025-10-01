"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const genai_1 = require("@google/genai");
const prompt_1 = require("../helper/prompt");
const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new genai_1.GoogleGenAI({ apiKey: API_KEY });
class MailerController {
    constructor() {
        this.genrateMail = (0, express_async_handler_1.default)(async (req, res) => {
            const { content, tone, length, } = req.body;
            try {
                if (!content || !tone || !length) {
                    return res
                        .status(400)
                        .json({ error: "Please provide all required fields" });
                }
                const systemPrompt = `Generate an email: ${prompt_1.promptHelper[tone]} and ${length} in length. also separate the subject, body and to (email if added) with different params do not make it a json object just a string with the params To:, Subject: and Body:`;
                const response = await genAI.models.generateContent({
                    model: "gemini-2.0-flash-001",
                    contents: content,
                    config: {
                        systemInstruction: systemPrompt,
                    },
                });
                res.json({ success: true, summary: response.text });
            }
            catch (error) {
                console.error("Error in genrateMail:", error);
                return res.status(500).json({ error: "Internal Server Error" });
            }
        });
    }
}
exports.default = MailerController;
