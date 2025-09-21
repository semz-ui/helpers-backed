import express, { Request, Response } from "express";
import cors from "cors"
import dotenv from "dotenv"

const app = express()
dotenv.config()
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors())

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from Express + TypeScript!");
});

app.use('/api/cover-letters', require('./routes/cover_letter_route'));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
