import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      await req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    console.log(token)
    if (!token) {
      
      throw new ApiError(401, "Unauthorized request");
    }
    console.log("token",token)
    const decodeToken =jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  console.log("decodeToken",decodeToken)
    const user = await User.findById(decodeToken?._id).select(
      "-password -refreshToken"
    );
  
    if (!user) {
      //?discuss about frontend
      throw new ApiError(401, "Invalid Access Token");
    }
  
    req.user = user;
  
    next();
  } catch (error) {
    throw new ApiError(401,"Invalid Access Token")
  }
});
