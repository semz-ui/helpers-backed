import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { GoogleGenAI } from "@google/genai";
import { promptHelper } from "../helper/prompt";

const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenAI({ apiKey: API_KEY });

export default class MailerController {
  genrateMail = expressAsyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const {
        content,
        tone,
        length,
      }: { content: string; tone: keyof typeof promptHelper; length: string } =
        req.body;
      try {
        if (!content || !tone || !length) {
          return res
            .status(400)
            .json({ error: "Please provide all required fields" });
        }

        const systemPrompt = `Generate an email: ${promptHelper[tone]} and ${length} in length. also separate the subject, body and to (email if added) with different params do not make it a json object just a string with the params To:, Subject: and Body:`;

        const response = await genAI.models.generateContent({
          model: "gemini-2.0-flash-001",
          contents: content,
          config: {
            systemInstruction: systemPrompt,
          },
        });

        res.json({ success: true, summary: response.text });
      } catch (error) {
        console.error("Error in genrateMail:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    }
  );
}
