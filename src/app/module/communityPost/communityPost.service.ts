import { prisma } from "../../utils/prisma";
import { paginationHelper, type IOptions } from "../../helper/paginationHelper";
import httpStatus from "http-status-codes";
import AppError from "../../errorHelper/AppError";

// ─── Create Post ──────────────────────────────────────────────
const createPost = async (userId: string, data: { postContent: string }) => {
  if (!data.postContent || data.postContent.trim() === "") {
    throw new AppError(httpStatus.BAD_REQUEST, "Post content cannot be empty");
  }

  const post = await prisma.communityPost.create({
    data: {
      postContent: data.postContent,
      userId,
    },
    include: {
      user: { omit: { password: true } },
    },
  });

  return post;
};

// ─── Get All Posts ────────────────────────────────────────────
const getAllPosts = async (filters: any, options: IOptions) => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const { searchTerm } = filters;

  const andConditions: any[] = [];

  // Search by post content (forum keyword search)
  if (searchTerm) {
    andConditions.push({
      postContent: {
        contains: searchTerm,
        mode: "insensitive",
      },
    });
  }

  const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};

  const posts = await prisma.communityPost.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: { [sortBy || "postDate"]: sortOrder || "desc" },
    include: {
      user: {
        select: { id: true, name: true, role: true },
      },
    },
  });

  const total = await prisma.communityPost.count({ where: whereConditions });

  return {
    meta: { total, page, limit },
    data: posts,
  };
};

// ─── Get Single Post ──────────────────────────────────────────
const getPostById = async (id: string) => {
  const post = await prisma.communityPost.findUniqueOrThrow({
    where: { id },
    include: {
      user: { select: { id: true, name: true, role: true } },
    },
  });

  return post;
};

// ─── Get My Posts ─────────────────────────────────────────────
const getMyPosts = async (userId: string, options: IOptions) => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const posts = await prisma.communityPost.findMany({
    where: { userId },
    skip,
    take: limit,
    orderBy: { [sortBy || "postDate"]: sortOrder || "desc" },
  });

  const total = await prisma.communityPost.count({ where: { userId } });

  return {
    meta: { total, page, limit },
    data: posts,
  };
};

// ─── Update Post ──────────────────────────────────────────────
const updatePost = async (
  id: string,
  data: { postContent: string },
  userId: string,
  role: string
) => {
  const post = await prisma.communityPost.findUniqueOrThrow({ where: { id } });

  // Only the post author or admin can update
  if (role !== "ADMIN" && post.userId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to update this post");
  }

  const updated = await prisma.communityPost.update({
    where: { id },
    data: { postContent: data.postContent },
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  return updated;
};

// ─── Delete Post ──────────────────────────────────────────────
const deletePost = async (id: string, userId: string, role: string) => {
  const post = await prisma.communityPost.findUniqueOrThrow({ where: { id } });

  // Only the post author or admin can delete
  if (role !== "ADMIN" && post.userId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to delete this post");
  }

  const deleted = await prisma.communityPost.delete({ where: { id } });

  return deleted;
};

export const CommunityPostServices = {
  createPost,
  getAllPosts,
  getPostById,
  getMyPosts,
  updatePost,
  deletePost,
};
