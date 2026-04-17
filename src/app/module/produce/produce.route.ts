import { Router } from "express";
import { ProduceControllers } from "./produce.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRole } from "@prisma/client";

const router: Router = Router();

// Public: Browse all available produce (marketplace)
router.get("/", ProduceControllers.getAllProduce);

// Public: Get single produce details
router.get("/:id", ProduceControllers.getProduceById);

// Vendor: Get own produce listings
router.get(
  "/my/listings",
  checkAuth(UserRole.VENDOR),
  ProduceControllers.getMyProduce
);

// Vendor: Create a new produce listing
router.post(
  "/",
  checkAuth(UserRole.VENDOR),
  ProduceControllers.createProduce
);

// Vendor / Admin: Update produce
router.patch(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.VENDOR),
  ProduceControllers.updateProduce
);

// Vendor / Admin: Delete produce
router.delete(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.VENDOR),
  ProduceControllers.deleteProduce
);

export const ProduceRoutes: Router = router;
