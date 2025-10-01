import expressAsyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { User } from "../model/user.model";
import { Request, Response, NextFunction } from "express";

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}



const protect = expressAsyncHandler(async (req:Request, res:Response, next:NextFunction) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header and remove Bearer from string
      token = req.headers.authorization.split(" ")[1];
      // Verify token
      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables");
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
      // Get user from database
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      console.log(error);
      res.status(401);
      throw new Error("Not authorized to access this route");
    }
  }
  if (!token) {
    res.status(401);
    throw new Error("Not authorized no token");
  }
});

export { protect };