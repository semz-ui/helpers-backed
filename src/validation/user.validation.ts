import Joi from "joi";

export const userRegisterValidationSchema = Joi.object({
  full_name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  occupation: Joi.string().allow("").optional(),
  years_of_experience: Joi.number().min(0).max(50).optional(),
  password: Joi.string().min(6).required(),
});

export const userLoginValidationSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
})