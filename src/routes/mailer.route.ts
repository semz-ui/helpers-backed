import { Router } from "express";
import MailerController from "../controllers/mailer.controller";

const router = Router();

const { genrateMail } = new MailerController();

router.post("/generate-mail", genrateMail);

module.exports = router;