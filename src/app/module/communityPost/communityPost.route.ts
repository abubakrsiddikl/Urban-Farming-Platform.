import { Router } from "express";
import { CommunityPostControllers } from "./communityPost.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRole } from "@prisma/client";

const router: Router = Router();

// Public: Browse all community forum posts
router.get("/", CommunityPostControllers.getAllPosts);

// Public: Get single post
router.get("/:id", CommunityPostControllers.getPostById);

// All authenticated users: Get own posts
router.get(
  "/my/posts",
  checkAuth(...Object.values(UserRole)),
  CommunityPostControllers.getMyPosts,
);

// All authenticated users: Create a new post
router.post(
  "/",
  checkAuth(...Object.values(UserRole)),
  CommunityPostControllers.createPost,
);

// Author / Admin: Update post content
router.patch(
  "/:id",
  checkAuth(...Object.values(UserRole)),
  CommunityPostControllers.updatePost,
);

// Author / Admin: Delete a post
router.delete(
  "/:id",
  checkAuth(...Object.values(UserRole)),
  CommunityPostControllers.deletePost,
);

export const CommunityPostRoutes: Router = router;
