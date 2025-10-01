import { GoogleGenAI } from "@google/genai";
import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import fs from "fs";
import multer from "multer";
import path from "path";
import { coverLetterPrompt } from "../helper/prompt";
import { CoverLetter } from "../model/cover_letter.model";

const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenAI({ apiKey: API_KEY });

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const upload = multer({ dest: uploadDir });

export default class CoverLetterController {
    generateCoverLetter = expressAsyncHandler(async (req: Request, res: Response):Promise<any> => {
        console.log("started")
       try {
         upload.single("file"), async (req:Request, res:Response) => {
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
                  systemInstruction: coverLetterPrompt
                },
            });
        
            // 3. Delete the temporary file from the API after use
             genAI.files.delete({ name: uploadedFile.name || "" });
        
            fs.unlinkSync(filePath);
        
            // 5. Send the final response back to the frontend
            // console.log("Final response:", response.text);
            res.json({ success: true, summary: response.text });
          } catch (error) {
            console.error("Error:", error);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
            res.status(500).json({ error: "Failed to process file" });
          }
        }
       } catch (error) {
        console.error("Unexpected Error:", error);
        res.status(500).json({ error: "An unexpected error occurred" });
       }
    })

    getPersoanlCoverLetters = expressAsyncHandler(async(req:Request, res:Response) => {
        try {
            const coverLetters = await CoverLetter.find({user:req.user})
            res.status(200).json({success:true, data:coverLetters})
        } catch (error) {
            console.log(error)
        }
    })
}