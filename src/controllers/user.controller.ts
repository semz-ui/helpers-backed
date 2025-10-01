import { User } from "../model/user.model";
import expressAsyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { Request, Response } from "express";
import { userRegisterValidationSchema, userLoginValidationSchema } from "../validation/user.validation";


export default class Auth {

 createUser = expressAsyncHandler(async (req: Request, res: Response):Promise<any> => {
    const { error, value } = userRegisterValidationSchema.validate(req.body);
    
    if (error) {
        res.status(400).json({
            errors: error.details[0].message
        });
        return
    }
    const { full_name, email, occupation, years_of_experience, password } =
        req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error(
            "Email already exists please login or use a different email"
        );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const createdUser = await User.create({
        full_name,
        email,
        occupation,
        years_of_experience,
        password: hashedPassword,
    });

    if (!createdUser) {
        res.status(400);
        throw new Error("Invalid user data");
    }

    // Generate JWT token
    const token = generateToken(createdUser._id.toString());
const {password: _, ...returnedUser} = createdUser.toObject();
res.status(201).json({...returnedUser, token });
});

 loginUser = expressAsyncHandler(async(req: Request, res: Response):Promise<any> => {

    const { error, value } = userLoginValidationSchema.validate(req.body);
    console.log(value, error, req.body);
    if (error) {
        // Joi gives you structured error details
        res.status(400).json({
            errors: error.details.map(d => d.message)
        });
        return
    } const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
        // Generate JWT token
        const token = generateToken(user._id.toString());

        const returnedUser = user.populate("User", "-password");
        res.status(200).json({ ...returnedUser, token });
    } else {
        res.status(401);
        throw new Error("Invalid email or password");
    }
});



}

const generateToken = (id: string): string => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const options: SignOptions = {
        expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"],
    };

    return jwt.sign({ id }, process.env.JWT_SECRET, options);
};

