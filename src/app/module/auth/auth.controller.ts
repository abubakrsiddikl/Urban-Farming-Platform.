import type { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { AuthServices } from "./auth.service";
import { createUserToken } from "../../utils/userToken";
import { setAuthCookie } from "../../utils/setAuthCookie";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from 'http-status-codes'

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.login(req.body);
  const userToken = await createUserToken(result);
  setAuthCookie(res, userToken);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Login successful",
    data: {
        user: result,
        accessToken: userToken.accessToken
    },
  });
});

// logout 
const logout = catchAsync(async (req: Request, res: Response) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
 
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
 
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logout successful",
    data: null,
  });
});

export const AuthControllers = {
  login,
  logout,
};
