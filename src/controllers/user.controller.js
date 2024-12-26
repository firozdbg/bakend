import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinaryUploader.js";
import { User } from "../models/user.model.js";

import { ApiResponse } from "../utils/ApiResponse.js";
import { compareSync } from "bcrypt";
import jwt from 'jsonwebtoken'
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (err) {
    throw new ApiError(
      500,
      "Something went wrong generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend
  //&  validation -not empty
  //& check if user already exists:-username and email
  //& check for image check for avatar
  //& upload then to cloudinary
  //& create user object-create entry in db
  //& remove password and refresh token field from response
  //& check for user creation
  //& return res

  const { fullname, email, username, password } = req.body;
  console.log(fullname, email, password, username);
  // if (fullname === "") {
  //   throw new ApiError(400,"FullName is required")
  // }
  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

 
  const existsUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existsUser) {
    throw new ApiError(409, "User with email or username already register");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;

  // const coverImageLocalPath = req.files?.coverImage[0]?.path

  let coverImageLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "something went while registering the User");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //? req body->data
  //? username or email
  //? find the user
  //? password check
  //? access and refresh token generate
  //? send to it cookie

  const { email, username, password } = req.body;

  // if (!username && !email) {
  //   throw new ApiError(400, "username or password required");
  // }

  if (!(username || email)) {
    throw new ApiError(400, "username or password required");
  }


  const user = await User.findOne({ $or: [{ email }, { username }] });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid User credential");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  ).lean();

  const options = {
    httpOnly: true,
    secure: true,
  };

  // const userObject = {
  //   user:loggedInUser
  // }

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200, 
        {
            user: loggedInUser, accessToken, refreshToken
        },
        "User logged In Successfully"
      )
    )
});


const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken:undefined
      }
    },
    {
      new:true
    }
  )

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out"))
})
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken
  
  if (!incomingRefreshToken) {
    throw new ApiError(401,"unauthorized request")
  }

  try {
    const decodedToken=jwt.verify(
        incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET
      )
        const user= await User.findById(decodedToken?._id)
      
    if (!user) {
      throw new ApiError(401,"Invalid refresh Token")
    }
  
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401,"Refresh token is expired or used")
    }
  
    const options = {
      httpOnly: true,
      secure:true
    }
    
    const { accessToken, newRefreshToken }=await generateAccessAndRefreshTokens(user.id)
  
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken)
      .json(
        200,
        {
          accessToken,
          refreshToken: newRefreshToken
        
        },
        "Access token refreshed"
      )
  } catch (error) {
    throw new ApiError(401,error?.message||"invalid refresh token")
  }
})
    



export { registerUser, loginUser,logOutUser,refreshAccessToken };
