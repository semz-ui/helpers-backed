"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const genai_1 = require("@google/genai");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const prompt_1 = require("../helper/prompt");
const cover_letter_model_1 = require("../model/cover_letter.model");
const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new genai_1.GoogleGenAI({ apiKey: API_KEY });
const uploadDir = path_1.default.join(__dirname, "uploads");
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const upload = (0, multer_1.default)({ dest: uploadDir });
class CoverLetterController {
    constructor() {
        this.generateCoverLetter = (0, express_async_handler_1.default)(async (req, res) => {
            console.log("started");
            try {
                upload.single("file"), async (req, res) => {
                    if (!req.file) {
                        return res.status(400).send("No file uploaded.");
                    }
                    const filePath = path_1.default.join(__dirname, "uploads", req.file.filename);
                    const mimeType = req.file.mimetype;
                    try {
                        // 1. Upload the file to the Gemini Files API
                        const uploadedFile = await genAI.files.upload({
                            file: filePath,
                            config: {
                                mimeType: mimeType,
                                displayName: req.file.originalname,
                            },
                        });
                        // Wait for the file to be processed (optional but good practice)
                        let getFile = await genAI.files.get({ name: uploadedFile.name || "" });
                        while (getFile.state === "PROCESSING") {
                            await new Promise((resolve) => setTimeout(resolve, 5000));
                            getFile = await genAI.files.get({ name: uploadedFile.name || "" });
                            console.log("File is still processing...");
                        }
                        if (getFile.state === "FAILED") {
                            throw new Error("File processing failed.");
                        }
                        const jobDesc = req.body.jobDesc;
                        // 2. Use the uploaded file's URI in a generate_content call
                        const response = await genAI.models.generateContent({
                            model: "gemini-2.0-flash-001",
                            contents: [
                                {
                                    text: `create a cover letter for ${jobDesc} using my resume uploaded `,
                                },
                                {
                                    fileData: {
                                        mimeType: mimeType,
                                        fileUri: uploadedFile.uri,
                                    },
                                },
                            ],
                            config: {
                                systemInstruction: prompt_1.coverLetterPrompt
                            },
                        });
                        // 3. Delete the temporary file from the API after use
                        genAI.files.delete({ name: uploadedFile.name || "" });
                        fs_1.default.unlinkSync(filePath);
                        // 5. Send the final response back to the frontend
                        // console.log("Final response:", response.text);
                        res.json({ success: true, summary: response.text });
                    }
                    catch (error) {
                        console.error("Error:", error);
                        if (fs_1.default.existsSync(filePath)) {
                            fs_1.default.unlinkSync(filePath);
                        }
                        res.status(500).json({ error: "Failed to process file" });
                    }
                };
            }
            catch (error) {
                console.error("Unexpected Error:", error);
                res.status(500).json({ error: "An unexpected error occurred" });
            }
        });
        this.getPersoanlCoverLetters = (0, express_async_handler_1.default)(async (req, res) => {
            try {
                const coverLetters = await cover_letter_model_1.CoverLetter.find({ user: req.user });
                res.status(200).json({ success: true, data: coverLetters });
            }
            catch (error) {
                console.log(error);
            }
        });
    }
}
exports.default = CoverLetterController;
