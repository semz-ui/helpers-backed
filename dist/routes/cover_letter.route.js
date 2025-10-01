"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const genai_1 = require("@google/genai");
const multer_1 = __importDefault(require("multer"));
const prompt_1 = require("../helper/prompt");
const separate_1 = require("../helper/separate");
const authMiddleware_1 = require("../middleware/authMiddleware");
const cover_letter_model_1 = require("../model/cover_letter.model");
const cover_letter_controller_1 = __importDefault(require("../controllers/cover_letter.controller"));
const router = express_1.default.Router();
const { getPersoanlCoverLetters } = new cover_letter_controller_1.default();
const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new genai_1.GoogleGenAI({ apiKey: API_KEY });
const uploadDir = path_1.default.join(__dirname, "uploads");
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const upload = (0, multer_1.default)({ dest: uploadDir });
router.post("/upload-and-analyze", authMiddleware_1.protect, upload.single("file"), async (req, res) => {
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
                systemInstruction: prompt_1.coverLetterPrompt,
            },
        });
        genAI.files.delete({ name: uploadedFile.name || "" });
        fs_1.default.unlinkSync(filePath);
        console.log("Final response:", response.text);
        const sepText = (0, separate_1.parseResponse)(response.text || "");
        const createdCoverLetter = await cover_letter_model_1.CoverLetter.create({
            title: sepText.title,
            description: sepText.description,
            user: req.user
        });
        res.json({ success: true, data: createdCoverLetter });
    }
    catch (error) {
        console.error("Error:", error);
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
        res.status(500).json({ error: "Failed to process file", success: false });
    }
});
router.get('/get-cover-letters', authMiddleware_1.protect, getPersoanlCoverLetters);
module.exports = router;
