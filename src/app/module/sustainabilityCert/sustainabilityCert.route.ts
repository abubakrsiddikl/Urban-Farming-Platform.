import { Router } from "express";
import { SustainabilityCertControllers } from "./sustainabilityCert.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRole } from "@prisma/client";

const router: Router = Router();

// Admin: Get all submitted certifications
router.get(
  "/",
  checkAuth(UserRole.ADMIN),
  SustainabilityCertControllers.getAllCerts,
);

// Vendor: Get own certifications
router.get(
  "/my/certs",
  checkAuth(UserRole.VENDOR),
  SustainabilityCertControllers.getMyCerts,
);

// Admin / Vendor: Get single certification by ID
router.get(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.VENDOR),
  SustainabilityCertControllers.getCertById,
);

// Vendor: Submit a new sustainability certification
router.post(
  "/",
  checkAuth(UserRole.VENDOR),
  SustainabilityCertControllers.createCert,
);

// Admin / Vendor: Update certification details
router.patch(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.VENDOR),
  SustainabilityCertControllers.updateCert,
);

// Admin / Vendor: Delete a certification
router.delete(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.VENDOR),
  SustainabilityCertControllers.deleteCert,
);

export const SustainabilityCertRoutes: Router = router;
