import type { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { SustainabilityCertServices } from "./sustainabilityCert.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import pick from "../../utils/pick";

// ─── Submit Certification ─────────────────────────────────────
const createCert = catchAsync(async (req: Request, res: Response) => {
  // Vendor submits their organic/sustainability certification for admin review
  const result = await SustainabilityCertServices.createCert(
    req.user?.id as string,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Sustainability certification submitted successfully",
    data: result,
  });
});

// ─── Get All Certifications (Admin) ───────────────────────────
const getAllCerts = catchAsync(async (req: Request, res: Response) => {
  // Admin can filter by certifyingAgency or vendorId
  const filters = pick(req.query, ["searchTerm", "certifyingAgency", "vendorId"]);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await SustainabilityCertServices.getAllCerts(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Certifications fetched successfully",
    data: result,
  });
});

// ─── Get Single Certification ──────────────────────────────────
const getCertById = catchAsync(async (req: Request, res: Response) => {
  const result = await SustainabilityCertServices.getCertById(req.params.id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Certification fetched successfully",
    data: result,
  });
});

// ─── Get My Certifications (Vendor) ───────────────────────────
const getMyCerts = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await SustainabilityCertServices.getMyCerts(
    req.user?.id as string,
    options
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My certifications fetched successfully",
    data: result,
  });
});

// ─── Update Certification ─────────────────────────────────────
const updateCert = catchAsync(async (req: Request, res: Response) => {
  const result = await SustainabilityCertServices.updateCert(
    req.params.id as string,
    req.body,
    req.user?.id as string,
    req.user?.role as string
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Certification updated successfully",
    data: result,
  });
});

// ─── Delete Certification ─────────────────────────────────────
const deleteCert = catchAsync(async (req: Request, res: Response) => {
  const result = await SustainabilityCertServices.deleteCert(
    req.params.id as string,
    req.user?.id as string,
    req.user?.role as string
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Certification deleted successfully",
    data: result,
  });
});

export const SustainabilityCertControllers = {
  createCert,
  getAllCerts,
  getCertById,
  getMyCerts,
  updateCert,
  deleteCert,
};
