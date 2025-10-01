"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const connectDb_1 = __importDefault(require("./db/connectDb"));
dotenv_1.default.config();
(0, connectDb_1.default)();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
app.get("/", (req, res) => {
    res.send("Hello from Express + TypeScript!");
});
app.use('/api/users', require('./routes/user.route'));
app.use('/api/cover-letters', require('./routes/cover_letter.route'));
app.use('/api/mail', require('./routes/mailer.route'));
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
