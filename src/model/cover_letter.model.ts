import { Document, model, Schema, Types } from "mongoose";
import { ICoverLetter } from "../types/cover_letter.type";

interface IModelCoverLetter extends ICoverLetter, Document {
  _id: Types.ObjectId;
}

const coverLetterSchema: Schema = new Schema({
    // user: {
    //   type: Types.ObjectId,
    //   ref: "User",
    //   required: [true, "Please add a user"],
    // },
    title: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  });

  export const CoverLetter = model<IModelCoverLetter>("CoverLetter", coverLetterSchema)