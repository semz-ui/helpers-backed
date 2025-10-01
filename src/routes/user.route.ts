import express, {Request, Response} from "express"

const router = express.Router();

import Auth from "../controllers/user.controller";

const {createUser, loginUser} = new Auth();

router.post("/register",createUser);
router.post("/login",loginUser);

module.exports = router;