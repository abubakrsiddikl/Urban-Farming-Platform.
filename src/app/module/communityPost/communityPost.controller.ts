import type { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { CommunityPostServices } from "./communityPost.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import pick from "../../utils/pick";

// ─── Create Community Post ────────────────────────────────────
const createPost = catchAsync(async (req: Request, res: Response) => {
  // Any authenticated user can create a post in the community forum
  const result = await CommunityPostServices.createPost(
    req.user?.id as string,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Post created successfully",
    data: result,
  });
});

// ─── Get All Posts ────────────────────────────────────────────
const getAllPosts = catchAsync(async (req: Request, res: Response) => {
  // Search by post content; paginate results
  const filters = pick(req.query, ["searchTerm"]);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await CommunityPostServices.getAllPosts(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Posts fetched successfully",
    data: result,
  });
});

// ─── Get Single Post ──────────────────────────────────────────
const getPostById = catchAsync(async (req: Request, res: Response) => {
  const result = await CommunityPostServices.getPostById(req.params.id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Post fetched successfully",
    data: result,
  });
});

// ─── Get My Posts ─────────────────────────────────────────────
const getMyPosts = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await CommunityPostServices.getMyPosts(
    req.user?.id as string,
    options
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My posts fetched successfully",
    data: result,
  });
});

// ─── Update Post ──────────────────────────────────────────────
const updatePost = catchAsync(async (req: Request, res: Response) => {
  const result = await CommunityPostServices.updatePost(
    req.params.id as string,
    req.body,
    req.user?.id as string,
    req.user?.role as string
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Post updated successfully",
    data: result,
  });
});

// ─── Delete Post ──────────────────────────────────────────────
const deletePost = catchAsync(async (req: Request, res: Response) => {
  const result = await CommunityPostServices.deletePost(
    req.params.id as string,
    req.user?.id as string,
    req.user?.role as string
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Post deleted successfully",
    data: result,
  });
});

export const CommunityPostControllers = {
  createPost,
  getAllPosts,
  getPostById,
  getMyPosts,
  updatePost,
  deletePost,
};
