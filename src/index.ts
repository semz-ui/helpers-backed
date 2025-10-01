import express, { Request, Response } from "express";
import cors from "cors"
import dotenv from "dotenv"
import connectDB from "./db/connectDb";

dotenv.config()

connectDB()
const app = express()
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors())
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from Express + TypeScript!");
});

app.use('/api/users', require('./routes/user.route'));
app.use('/api/cover-letters', require('./routes/cover_letter.route'));
app.use('/api/mail', require('./routes/mailer.route'));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
