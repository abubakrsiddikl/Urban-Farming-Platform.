import type { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { VendorProfileServices } from "./vendorProfile.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import pick from "../../utils/pick";

// ─── Create Vendor Profile ────────────────────────────────────
const createVendorProfile = catchAsync(async (req: Request, res: Response) => {
  // Vendor profile is created for the currently logged-in vendor user
  const result = await VendorProfileServices.createVendorProfile(
    req.user?.id as string,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Vendor profile created successfully",
    data: result,
  });
});

// ─── Get All Vendor Profiles ──────────────────────────────────
const getAllVendorProfiles = catchAsync(async (req: Request, res: Response) => {
  // Pick allowed filter fields from query
  const filters = pick(req.query, ["searchTerm", "certificationStatus", "farmLocation"]);

  // Pick pagination/sorting options from query
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await VendorProfileServices.getAllVendorProfiles(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Vendor profiles fetched successfully",
    data: result,
  });
});

// ─── Get Single Vendor Profile ────────────────────────────────
const getVendorProfileById = catchAsync(async (req: Request, res: Response) => {
  const result = await VendorProfileServices.getVendorProfileById(req.params.id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Vendor profile fetched successfully",
    data: result,
  });
});

// ─── Get My Vendor Profile (for logged-in vendor) ─────────────
const getMyVendorProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await VendorProfileServices.getMyVendorProfile(req.user?.id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My vendor profile fetched successfully",
    data: result,
  });
});

// ─── Update Vendor Profile ────────────────────────────────────
const updateVendorProfile = catchAsync(async (req: Request, res: Response) => {
  // Admin can update any profile; vendor can update only their own
  const result = await VendorProfileServices.updateVendorProfile(
    req.params.id as string,
    req.body,
    req.user?.id as string,
    req.user?.role as string
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Vendor profile updated successfully",
    data: result,
  });
});

// ─── Delete Vendor Profile ────────────────────────────────────
const deleteVendorProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await VendorProfileServices.deleteVendorProfile(req.params.id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Vendor profile deleted successfully",
    data: result,
  });
});

// ─── Approve Vendor (Admin only) ──────────────────────────────
const approveVendor = catchAsync(async (req: Request, res: Response) => {
  // Admin approves a vendor's certification status
  const result = await VendorProfileServices.approveVendor(req.params.id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Vendor approved successfully",
    data: result,
  });
});

export const VendorProfileControllers = {
  createVendorProfile,
  getAllVendorProfiles,
  getVendorProfileById,
  getMyVendorProfile,
  updateVendorProfile,
  deleteVendorProfile,
  approveVendor,
};
