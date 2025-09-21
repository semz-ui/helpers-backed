import express, {Request, Response} from "express"
import path from "path";
import fs from "fs"
import { GoogleGenAI } from "@google/genai";
import multer from "multer"
import { coverLetterPrompt } from "../helper/prompt";

const router = express.Router();

const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenAI({ apiKey: API_KEY });

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const upload = multer({ dest: uploadDir });

router.post("/upload-and-analyze", upload.single("file"), async (req:Request, res:Response) => {
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

     //delete multer file
  //   fs.unlink(filePath, (err) => {
  //   if (err) {
  //     console.error("Error deleting file:", err);
  //     return res.status(500).send("Error deleting file");
  //   }
  // })

    // 4. Clean up the temporary local file
    fs.unlinkSync(filePath);

    // 5. Send the final response back to the frontend
    // console.log("Final response:", response.text);
    res.json({ success: true, summary: response });
  } catch (error) {
    console.error("Error:", error);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.status(500).json({ error: "Failed to process file" });
  }
});

module.exports = router;
