import {Document, model, Schema, Types} from "mongoose";
import { IUser } from "../types/user.type";

 interface IUserModel extends IUser, Document {
     _id: Types.ObjectId;
 }

const userSChema:Schema = new Schema({
    full_name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    occupation: {
        type: String,
        default: "",
    },
    years_of_experience: {
        type: Number,
        default: 0,
    },
    password: {
        type: String,
        required: true,
    }
}, {
    timestamps: true,
})

export const User = model<IUserModel>("User", userSChema);
