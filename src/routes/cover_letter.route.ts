import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import multer from "multer";
import { coverLetterPrompt } from "../helper/prompt";
import { parseResponse } from "../helper/separate";
import { protect } from "../middleware/authMiddleware";
import { CoverLetter } from "../model/cover_letter.model";
import CoverLetterController from "../controllers/cover_letter.controller";

const router = express.Router();
const {getPersoanlCoverLetters} = new CoverLetterController()

const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenAI({ apiKey: API_KEY });

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const upload = multer({ dest: uploadDir });

router.post(
  "/upload-and-analyze",
  protect,
  upload.single("file"),
  async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }
    

    const filePath = path.join(__dirname, "uploads", req.file.filename);
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
          systemInstruction: coverLetterPrompt,
        },
      });

      genAI.files.delete({ name: uploadedFile.name || "" });

      fs.unlinkSync(filePath);

    
      console.log("Final response:", response.text);
      const sepText = parseResponse(response.text || "");

      const createdCoverLetter = await CoverLetter.create({
        title: sepText.title,
        description: sepText.description,
        user: req.user
      })
      res.json({ success: true, data: createdCoverLetter });
    } catch (error) {
      console.error("Error:", error);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      res.status(500).json({ error: "Failed to process file", success: false });
    }
  }
);

router.get('/get-cover-letters',protect, getPersoanlCoverLetters)

module.exports = router;
