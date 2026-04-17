import { Router } from "express";
import { RentalSpaceControllers } from "./rentalSpace.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRole } from "@prisma/client";

const router = Router();

// Public: Browse all available rental spaces (location-based search via query params)
router.get("/", RentalSpaceControllers.getAllRentalSpaces);

// Public: Get single rental space details
router.get("/:id", RentalSpaceControllers.getRentalSpaceById);

// Vendor: Get own rental spaces
router.get(
  "/my/spaces",
  checkAuth(UserRole.VENDOR),
  RentalSpaceControllers.getMyRentalSpaces
);

// Vendor: Create a new rental space
router.post(
  "/",
  checkAuth(UserRole.VENDOR),
  RentalSpaceControllers.createRentalSpace
);

// Vendor / Admin: Update rental space info or availability
router.patch(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.VENDOR),
  RentalSpaceControllers.updateRentalSpace
);

// Vendor / Admin: Delete a rental space
router.delete(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.VENDOR),
  RentalSpaceControllers.deleteRentalSpace
);

export const RentalSpaceRoutes: Router = router;
