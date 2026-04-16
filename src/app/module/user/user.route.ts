import { Router } from "express";
import { UserControllers } from "./user.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRole } from "@prisma/client";

const router = Router();

router.post("/", UserControllers.createUser);
router.get("/",checkAuth(UserRole.ADMIN), UserControllers.getAllUsers);
router.get(
  "/me",
  checkAuth(...Object.values(UserRole)),
  UserControllers.getMyProfile,
);
router.patch("/:id",checkAuth(...Object.values(UserRole)), UserControllers.updateUser);
router.delete("/:id", checkAuth(UserRole.ADMIN), UserControllers.deleteUser);

export const UserRoutes: Router = router;
