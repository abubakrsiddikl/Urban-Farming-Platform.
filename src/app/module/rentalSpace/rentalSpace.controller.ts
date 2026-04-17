import type { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { RentalSpaceServices } from "./rentalSpace.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import pick from "../../utils/pick";

// ─── Create Rental Space ──────────────────────────────────────
const createRentalSpace = catchAsync(async (req: Request, res: Response) => {
  // Only vendor can create rental spaces under their profile
  const result = await RentalSpaceServices.createRentalSpace(
    req.user?.id as string,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Rental space created successfully",
    data: result,
  });
});

// ─── Get All Rental Spaces ────────────────────────────────────
const getAllRentalSpaces = catchAsync(async (req: Request, res: Response) => {
  // Filter by location, availability, size
  const filters = pick(req.query, ["searchTerm", "location", "availability", "size"]);

  // Pagination and sorting
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await RentalSpaceServices.getAllRentalSpaces(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Rental spaces fetched successfully",
    data: result,
  });
});

// ─── Get Single Rental Space ──────────────────────────────────
const getRentalSpaceById = catchAsync(async (req: Request, res: Response) => {
  const result = await RentalSpaceServices.getRentalSpaceById(req.params.id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Rental space fetched successfully",
    data: result,
  });
});

// ─── Get My Rental Spaces (vendor's own spaces) ───────────────
const getMyRentalSpaces = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await RentalSpaceServices.getMyRentalSpaces(
    req.user?.id as string,
    options
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My rental spaces fetched successfully",
    data: result,
  });
});

// ─── Update Rental Space ──────────────────────────────────────
const updateRentalSpace = catchAsync(async (req: Request, res: Response) => {
  const result = await RentalSpaceServices.updateRentalSpace(
    req.params.id as string,
    req.body,
    req.user?.id as string,
    req.user?.role as string
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Rental space updated successfully",
    data: result,
  });
});

// ─── Delete Rental Space ──────────────────────────────────────
const deleteRentalSpace = catchAsync(async (req: Request, res: Response) => {
  const result = await RentalSpaceServices.deleteRentalSpace(
    req.params.id as string,
    req.user?.id as string,
    req.user?.role as string
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Rental space deleted successfully",
    data: result,
  });
});

export const RentalSpaceControllers = {
  createRentalSpace,
  getAllRentalSpaces,
  getRentalSpaceById,
  getMyRentalSpaces,
  updateRentalSpace,
  deleteRentalSpace,
};
