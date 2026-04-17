import { Router } from "express";
import { VendorProfileControllers } from "./vendorProfile.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRole } from "@prisma/client";

const router: Router = Router();

// Public: Get all vendor profiles (customers can browse)
router.get("/", VendorProfileControllers.getAllVendorProfiles);

// Public: Get single vendor profile by ID
router.get("/:id", VendorProfileControllers.getVendorProfileById);

// Vendor: Get own profile
router.get(
  "/my/profile",
  checkAuth(UserRole.VENDOR),
  VendorProfileControllers.getMyVendorProfile,
);

// Vendor: Create vendor profile (only vendors can create)
router.post(
  "/",
  checkAuth(UserRole.VENDOR),
  VendorProfileControllers.createVendorProfile,
);

// Vendor / Admin: Update vendor profile
router.patch(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.VENDOR),
  VendorProfileControllers.updateVendorProfile,
);

// Admin: Approve a vendor
router.patch(
  "/:id/approve",
  checkAuth(UserRole.ADMIN),
  VendorProfileControllers.approveVendor,
);

// Admin: Delete vendor profile
router.delete(
  "/:id",
  checkAuth(UserRole.ADMIN),
  VendorProfileControllers.deleteVendorProfile,
);

export const VendorProfileRoutes: Router = router;
